import express, { Express, Request, Response } from 'express';
const formidableMiddleware = require('express-formidable');
import { v4 as uuidv4 } from 'uuid';

import { FileParser, StatementFile } from './FileParser'
import { EventBus } from './EventBus';
import { StorageControl } from './StorageControl';

let PROJECT_ID = process.env["PROJECT_ID"] ?? '';
let BUCKET_EMAIL_ATTACHMENT = process.env["BUCKET_EMAIL_ATTACHMENT"] ?? '';
let TOPIC_EMAIL_RECEIVED = process.env["TOPIC_EMAIL_RECEIVED"] ?? '';

const eventBus = new EventBus(PROJECT_ID);
const storageControl = new StorageControl(PROJECT_ID, BUCKET_EMAIL_ATTACHMENT);

const port = 3000;
const fileParser = new FileParser();
const app: Express = express();


app.use(formidableMiddleware());

app.get('/', (req: Request, res: Response) => {
    console.log("HEADER:", req.headers);
    console.log("BODY:", req.body);

    res.send('EMAIL RECEIVER Server');
});

app.post('/webhook', async (req: Request, res: Response) => {
    const id: string = uuidv4();
    if (req.fields)
        req.fields["email_id"] = id;

    let attachments: StatementFile[] = [];
    if (req.files) {
        const files = fileParser.parseAttachments(req.files)
        attachments = await Promise.all(files.map(async file => {
            const gcpFile = await storageControl.upload(file.path, id, file.name);
            return {
                name: gcpFile[1],
                size: file.size,
                type: file.type,
                path: gcpFile[0].metadata.mediaLink as string
            }
        }));
    }
    await eventBus.publish(TOPIC_EMAIL_RECEIVED, {
        fields: req.fields,
        files: attachments
    }, {});

    res.status(200);
    res.send();
});

app.listen(port, () => {
    console.log(`[server]: Server new is running at http://localhost:${port}`);
});

