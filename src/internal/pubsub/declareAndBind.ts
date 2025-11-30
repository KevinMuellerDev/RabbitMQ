import amqp, { type Channel } from "amqplib"

type SimpleQueueType = "durable" | "transient";

export async function declareAndBind(
    conn: amqp.ChannelModel,
    exchange: string,
    queueName: string,
    key: string,
    queueType: SimpleQueueType,
): Promise<[Channel, amqp.Replies.AssertQueue]> {
    const channel = await conn.createChannel();
    const durable = queueType === "durable" ? true : false;
    const autoDelete = queueType === "durable" ? false : true;
    const exclusive = queueType === "durable" ? false : true;


    const queue = await channel.assertQueue(queueName, { durable, exclusive, autoDelete, arguments: null });
    await channel.bindQueue(queue.queue, exchange, key)

    return [channel, queue]
};