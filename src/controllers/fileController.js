import log4js from 'log4js';
/**
 * File controller module.
 */
export default class FileController {
    /**
     * Constructs FileController class
     * @param {FileManager} fileManager - File manager instance to use.
     */
    constructor(fileManager) {
        this._logger = log4js.getLogger('FileController');
        this.fileManager = fileManager;
    }

    async upload(req, res) {
        const file = req.file;
        if (!file) {
            return res.status(400).json({message: 'No file uploaded'});
        }
        try {
            this._logger.info(req.file);
            // await this.fileManager.upload(file);
            return res.status(200).json({message: 'Successfully uploaded file'});
        } catch (error) {
            this._logger.error(`Failed to upload file ${file}`, error);
        }
    }

    async list(req, res) {
        const payload = req.query;
        try {
            const files = await this.fileManager.list(payload.page, payload.listSize);
            return res.status(200).json({files});
        } catch (error) {
            this._logger.error(`Failed to list files`, error);
        }
    }

    async delete(req,res) {
        const payload = req.params;
        if(!payload.id) {
            return res.status(400).json({message: 'No file id provided'});
        }
        try {
            await this.fileManager.delete(payload.id);
            return res.status(200).json({message: 'Successfully deleted file'});
        } catch (error) {
            this._logger.error(`Failed to delete file with id ${payload.id}`, error);
        }
    }

    async getFile(req, res) {
        const payload = req.params;
        if(!payload.id) {
            return res.status(400).json({message: 'No file id provided'});
        }
        try {
            const file = await this.fileManager.getFile(payload.id);
            return res.status(200).json({file});
        } catch (error) {
            this._logger.error(`Failed to get file with id ${payload.id}`, error);
        }
    }

    async download(req, res) {
        const payload = req.params;
        if(!payload.id) {
            return res.status(400).json({message: 'No file id provided'});
        }
        try {
            const file = await this.fileManager.download(payload.id);
            return res.status(200).json({file});
        } catch (error) {
            this._logger.error(`Failed to download file with id ${payload.id}`, error);
        }
    }

    async update(req, res) {
        const payload = req.params;
        const file = req.file;
        if(!payload.id || !file) {
            return res.status(400).json({message: 'No file or id provided to update, please provide file and id'});
        }
        try {
            await this.fileManager.update(payload.id);
            return res.status(200).json({message: `Successfully updated file with id ${file.originalname}`});
        } catch (error) {
            this._logger.error(`Failed to update file ${file.originalname}`, error);
        }
    }
}