import type { ConfirmChannel } from "amqplib";

export default function publishJSON<T>(
    ch: ConfirmChannel,
    exchange: string,
    routingKey: string,
    value: T,
): Promise<void> {
    const jsonString = JSON.stringify(value);
    const serializedValue = Buffer.from(jsonString);
    return new Promise((resolve, reject) => {
        ch.publish(exchange, routingKey, serializedValue, { contentType: "application/json" }, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    })
};

