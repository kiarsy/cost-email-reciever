import { File, UploadResponse, Storage } from "@google-cloud/storage";
import { Metadata } from "@google-cloud/storage/build/src/nodejs-common";

export class StorageControl {
    storage: Storage;
    constructor(projectId: string, readonly bucketName: string) {
        this.storage = new Storage({
            projectId
        });
    }

    async upload(filePath: string, email_id: string, fileName: string): Promise<[File, string]> {
        const destination = `/${email_id}/${fileName}`;
        const file = await this.storage.bucket(this.bucketName).upload(filePath, {
            destination,
            gzip: true,
            metadata: {
                cacheControl: 'public, max-age=31536000',
            },
        },);
        return [file[0], destination];
    }

}