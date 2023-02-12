// const { PubSub } = require('@google-cloud/pubsub');
import { PubSub, Message } from '@google-cloud/pubsub';

export class EventBus {
    pubsub: PubSub;
    constructor(readonly projectId: string) {
        this.pubsub = new PubSub({ projectId });
    }

    async subscribe(subscriptionName: string, messageCallback: (message: Message) => void) {
        const subscription = await this.pubsub
            .subscription(subscriptionName);

        // Receive callbacks for new messages on the subscription
        subscription.on('message', messageCallback);

        // Receive callbacks for errors on the subscription
        subscription.on('error', error => {
            console.error('GOOGLE PUB/SUB:Received error:', error);
        });
    }

    async publish(topicName: string, json: any, attributes: { [k: string]: string } | null) {
        const topic = await this.pubsub
            .topic(topicName);

        await topic.publishMessage({
            json,
            attributes
        });
    }
}
