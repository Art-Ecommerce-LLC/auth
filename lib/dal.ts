import 'server-only'
 
import { cookies } from 'next/headers'
import { decrypt } from './encrypt'
import { cache } from 'react'
import db from './db'
import renderApi from '@api/render-api';



export const verifySession = cache(async () => {
    const cookie = cookies().get('session')?.value

    if (!cookie) {
        return { isAuth: false}
    }
    const session = await decrypt(cookie)
   
    if (!session.userId) {
        return { isAuth: false}
    }
   
    return { isAuth: true, userId: session.userId }
})

export const getUser = cache(async () => {
    const session = await verifySession()
    if (!session.isAuth) {
        return { isAuth: false}
    }
    try {
        const user = await db.user.findUnique({
            where: { 
                id: session.userId
            }
        })

        if (!user) {
            return { isAuth: false}
        }
        
        const { password , email, updatedAt, createdAt,  ...rest } = user
        return rest
    } catch (error) {
        return { isAuth: false}
    }
})

export const getOTPSession = cache(async () => {
    const cookie = cookies().get('otp')?.value
    if (!cookie) {
        return { isAuth: false}
    }
    try {
        const session = await decrypt(cookie)
    if (!session.userId) {
        return { isAuth: false}
    }

    // Check if the user has an active OTP session
    const otpSession = await db.oTP.findUnique({
        where: {
            userId: session.userId
        }
    })
    if (!otpSession) {
        return { isAuth: false}
    }

    return { isAuth: true }
    } catch (error) {
        return { isAuth: false}
    }   
})


export const getVerifyEmailSession = cache(async () => {
    const cookie = cookies().get('verify-email')?.value
    if (!cookie) {
        return { isAuth: false}
    }
    const session = await decrypt(cookie)

    if (!session.userId) {
        return { isAuth: false}
    }

    try {
        const emailVerification = await db.emailVerification.findUnique({
            where: {
                userId: session.userId
            }
        })
        if (!emailVerification) {
            return { isAuth: false}
        }
        return { isAuth: true }
    } catch (error) {
        return { isAuth: false}
    }
});

export const getResetPasswordSession = cache(async () => {
    const cookie = cookies().get('resetPassword')?.value
    if (!cookie) {
        return { isAuth: false}
    }
    const session = await decrypt(cookie)
    if (!session.userId) {
        return { isAuth: false}
    }
    try {
        // Check if the user has an active reset password session
        const resetPassword = await db.resetPassword.findUnique({
            where: {
                userId: session.userId
            }
        })
        if (!resetPassword) {
            return { isAuth: false}
        }

        return { isAuth: true }
    } catch (error) {
        return { isAuth: false}
    }
});

export const getSession = cache(async () => {
    const cookie = cookies().get('session')?.value
    if (!cookie) {
        return { isAuth: false}
    }
    const session = await decrypt(cookie)
    if (!session.userId) {
        return { isAuth: false}
    }
    // Find the sessionid in the database
    try {
        const sessionDb = await db.session.findUnique({
            where: {
                id: session.sessionId
            }
        })
        if (!sessionDb) {
            return { isAuth: false}
        }
        return { isAuth: true, session: sessionDb }
    } catch (error) {
        return { isAuth: false}
    }
});

export const getSessionData = cache(async (pageType: string) => {
    try {
        let session;
        const user = await getUser()
        switch (pageType) {
            case 'resetPassword':
                session = await getResetPasswordSession()
                return { isAuth: session.isAuth, user };
            case 'verifyEmail':
                session = await getVerifyEmailSession()
                return { isAuth: session.isAuth, user };
            case 'otp':
                session = await getOTPSession()
                return { isAuth: session.isAuth, user };
            case 'session':
                session = await getSession()
                if (!session) {
                    return { isAuth: false }
                }
                if (!session.session) {
                    return { isAuth: false }
                }
                return { isAuth: session.isAuth, user, mfaVerified: session.session.mfaVerified };
            default:
                return { isAuth: false }; 
        }}catch (error) {
        return { isAuth: false }
    }
});

export const getRenderProjects = cache(async () => {
    try {
        const renderProjects = []
        const renderApiKey = process.env.RENDER_API_KEY
        if (!renderApiKey) {
            return []
        }

        // initialize the render client
        renderApi.auth(renderApiKey);

        const user = await getUser()
        if (!user) {
            return []
        }

        if ("id" in user) {
            const projects = await db.renderDeploys.findMany({
                where: {
                    userId: user.id
                }
            })

            if (!projects) {
                return []
            }
            
            try {
                const renderServices = await renderApi.listServices({limit: 20})
                const { data } = renderServices

                for (const {service} of data) {
                    if (!service) {
                        return []
                    }
                    const renderDeploys = await renderApi.listDeploys({serviceId: service!.id})
                    const { data } = renderDeploys

                    if (service.suspended === "not_suspended") {

                        renderProjects.push({ 
                            name: service.name,
                            commit: data[0]?.deploy?.commit?.message ?? "",  // Ensure commit is never undefined
                            status: data[0]?.deploy?.status ?? "canceled",  // Default status if undefined
                            updatedAt: data[0]?.deploy?.updatedAt || "",
                          });

                        

                    }   

                }  

            } catch (error) {
                console.log(error)
                console.error("Error fetching render services")
            }

            return renderProjects
        } else {
            return []
        }
    }   catch (error) {
        return []
    }
});

export const getVercelProjects = cache(async () => {
    try {
        const vercelApiKey = process.env.VERCEL_API_KEY;
        const result = await fetch("https://api.vercel.com/v9/projects", {
            headers: {
                Authorization: `Bearer ${vercelApiKey}`
            },
            method: "get"
        });
        const data = await result.json();
        // Ensure that we return an empty array if no projects are found or an error occurs
        console.log(data.projects)
        for (const project of data.projects) {  
            console.log(project.crons.deploymentId)   
            const deployResult = await fetch(`https://api.vercel.com/v13/deployments/${project.crons.deploymentId}`, {
                "headers": {
                    "Authorization": "Bearer " + vercelApiKey
                },
                "method": "get"
            });
            const deployData = await deployResult.json();
            console.log(deployData)
        }
        return data.projects || [];
    } catch (error) {
        console.error("Error fetching Vercel projects:", error);
        return []; // Return an empty array if there's an error
    }
});