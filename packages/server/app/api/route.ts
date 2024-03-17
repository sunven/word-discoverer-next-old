// export const dynamic = 'force-dynamic' // defaults to auto
export async function GET(request: Request) {
  return new Response('Hello, Next.js!', {
    status: 200,
    // headers: { 'Set-Cookie': `token=${token.value}` },
    
  })}

export async function POST(request: Request) {
  return Response.json({ a: 'post' })
}
