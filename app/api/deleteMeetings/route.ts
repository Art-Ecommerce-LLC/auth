// import { NextRequest } from 'next/server'
// import { cookies } from 'next/headers'

// const schema = z.object({
//     startDatetime: z.string().min(1, 'Start date is required'),
//     endDatetime: z.string().min(1, 'End date is required'),
//   })

// export async function DELETE(request: NextRequest) {

//     // get the body of the request in a json
//     const body = await request.json();
//     const { startDatetime, endDatetime } = schema.parse(body);


//     // authenticate the user
//     const session = cookies().get('session');

//     if (!session) {
//         return {status: 401, body: {error: "User not authenticated"}}
//     }
