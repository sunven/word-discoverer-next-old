import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

interface IMDB {
  rating: number
  votes: number
  id: number
}
export interface Movie {
  title: string
  year: number
  released: Date
  plot: string
  type: 'movie' | 'series'
  imdb: IMDB
}

type MovieSummary = Pick<Movie, 'title' | 'imdb'>

// export const dynamic = 'force-dynamic' // defaults to auto
export async function GET(request: Request) {
  let client
  try {
    client = new MongoClient(process.env.MONGODB_URI as string)
    const database = client.db('sample_mflix')
    // Specifying a Schema is always optional, but it enables type hinting on
    // finds and inserts
    const movies = database.collection<Movie>('movies')
    const movie = await movies.findOne<MovieSummary>(
      { title: 'The Room' },
      {
        sort: { rating: -1 },
        projection: { _id: 0, title: 1, imdb: 1 },
      }
    )
    console.log(movie)
    return NextResponse.json(movie)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

export async function POST(request: Request) {
  return NextResponse.json({ a: 'post' })
}
