import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
    // get the body of the request
    const body = await req.json()

    console.log(body)
    return body
}