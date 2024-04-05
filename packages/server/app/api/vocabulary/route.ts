import { NextResponse } from 'next/server'
import { MongoClient, type Document } from 'mongodb'
import { useUser } from '@clerk/nextjs'

type VocabularyType = {
  userId: string
  list: string[]
}

/**
 * 获取指定名称的集合对象
 *
 * @param collectionName 集合名称
 * @returns 包含MongoClient和集合对象的对象
 */
function getCollection<T extends Document>(collectionName: string) {
  const client = new MongoClient(process.env.MONGODB_URI as string)
  const database = client.db('word_discoverer_next')
  const collection = database.collection<T>(collectionName)
  return { client, collection }
}

function getUserId() {
  // const { user } = useUser()
  // return user?.id
  return 'user_2dlurbjTBOMfILKKQQzFPnhPenI'
}

/**
 * 获取词汇信息
 *
 * @param request 请求对象
 * @returns 返回词汇信息的 JSON 格式响应
 */
export async function GET(request: Request) {
  const userId = getUserId()
  const { client, collection } = getCollection<VocabularyType>('vocabulary')
  const vocabulary = await collection.findOne<VocabularyType>({ userId })
  console.log(vocabulary)
  client.close()
  return NextResponse.json(vocabulary)
}

export async function POST(request: Request) {
  const res = (await request.json()) as string[]
  const userId = 'user_2dlurbjTBOMfILKKQQzFPnhPenI'
  const { client, collection } = getCollection<VocabularyType>('vocabulary')
  const vocabulary = await collection.findOne<VocabularyType>({ userId })
  let task
  if (vocabulary) {
    // task = collection.updateOne({ userId }, { $push: { list: { $each: res } } })
    task = collection.updateOne({ userId }, { $set: { list: Array.from(new Set([...vocabulary.list, ...res])) } })
  } else {
    task = collection.insertOne({
      userId,
      list: res,
    })
  }
  const result = await task
  client.close()
  return NextResponse.json(result)
}
