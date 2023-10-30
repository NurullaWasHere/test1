import log4js from "log4js";
import multer from "multer";
import fs from 'fs';
import path from 'path';
import fsPromises from 'fs/promises';

/**
 *  File Manager Service
 */
export default class FileManager {
  /**
   * Constructs FileManager class and initializes multer storage
   * @param {Connection} - Database connection
   * @param {[fileDir='uploads/']} - Directory to store files
   */
  constructor(connection,fileDir='uploads/') {
    this._logger = log4js.getLogger('FileManager');
    this.connection = connection;
    this.storage = multer.diskStorage({
      destination: function (_, __, cb) {
        cb(null, fileDir);
      },
      filename: function (_, file, cb) {
        cb(null, file.originalname);
      },
    });
  }
  /**
   * Uploads a file into the server and loads to db
   */
  async upload(fileField) {
    const uploadFunction = this._provideUpload();
    uploadFunction.single(fileField);
    this._logger.info(`Successfully uploaded file ${fileField} to server`);
  }
  /**
   * Lists files in the server
   * @param {number} [page] - page number, 1 by default
   * @param {number} [listSize] - size of the list, 10 by default
   * @returns {Array} - list of files
   */
  async list(page = 1, listSize = 10) {
    const result = this.connection.query(`SELECT * FROM files LIMIT ${listSize} OFFSET ${(page - 1) * listSize}`, (err) => {
      if (err) {
        this._logger.error(`Failed to select files from files table`, err);
        throw err;
      }
    });
    return result;
  }

  /**
   * Deletes file from server and db.
   * @param {number} id - id of the file to delete
   * @returns {void}
   */
  async delete(id) {
    const file = await this.connection.query(`SELECT * FROM files WHERE id = ${id}`, (err) => {
      if (err) {
        this._logger.error(`Failed to select file with id ${id} from files table`, err);
        throw err;
      }
    });
    const filePath = path.join(__dirname, 'uploads', file.name);
    await fsPromises.unlink(filePath);
    this.connection.query(`DELETE FROM files WHERE id = ${id}`, (err) => {
      if (err) {
        this._logger.error(`Failed to delete file with id ${id} from files table`, err);
        throw err;
      }
      this._logger.debug(`Successfully deleted file ${file.name} from database`)
    });
    this._logger.info(`Successfully deleted file ${file.name} from server`)
  }
  
  /**
   * Loads file information from db.
   * @param {number} id - id of the file to get
   * @returns {Object} - file information
   */
  async getFile(id) {
    const result = this.connection.query(`SELECT * FROM files WHERE id = ${id}`, (err) => {
      if (err) {
        this._logger.error(`Failed to select file with id ${id} from files table`, err);
        throw err;
      }
    });
    return result;
  }
  
  /**
   * Downloads file from server to client
   * @param {number} id - id of the file to download
   * @returns {Promise<StreamPipeOptions>} - file stream
   */
  async download(id) {
    const file = await this.connection.query(`SELECT * FROM files WHERE id = ${id}`, (err) => {
      if (err) {
        this._logger.error(`Failed to select file with id ${id} from files table`, err);
        throw err;
      }
    });
    const filePath = path.join(__dirname, 'uploads', file.name);
    return fs.createReadStream(filePath);
  }

  /**
   * Updated file and information about it in db
   * @param {number} id 
   * @returns {Promise<void>}
   */
  async update(id, fileField) {
    const currentFile = await this.connection.query(`SELECT * FROM files WHERE id = ${id}`);
    const filePath = path.join(__dirname, 'uploads', currentFile.name);
    await fsPromises.unlink(filePath);
    const uploadFunction = this._provideUpload();
    uploadFunction.single(fileField);
    await this.connection.query(`UPDATE files
    SET
        name = '${fileField.originalname}',
        extension = '${fileField.extension || fileField.originalname.split('.').pop()}',
        mime_type = '${fileField?.mimetype}',
        size = '${fileField?.size}',
        upload_date = '${new Date().toISOString().slice(0, 19).replace('T', ' ')}'
    WHERE id = '${id}';`, (err) => {
      if (err) {
        this._logger.error(`Failed to update file ${currentFile.name} from files table`, err);
        throw err;
      }
    });
    this._logger.info(`Successfully updated file with id ${id} from files table`);
  }
  _provideUpload() {
    return multer({ storage: this.storage });
  }
}