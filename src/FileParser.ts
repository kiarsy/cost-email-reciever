import { Files } from 'formidable'

export type StatementFile = {
    name: string;
    size: number;
    type: string;
    path: string;
};

export class FileParser {
    parseAttachments(files: Files): StatementFile[] {
        return Object.keys(files).map(file => {
            const fileA = files![file] as any;
            return {
                name: fileA.name,
                size: fileA.size,
                type: fileA.type,
                path: fileA.path
            };
        });
    }



}
