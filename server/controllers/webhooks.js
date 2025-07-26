import { Webhook } from 'svix'
import Stripe from 'stripe'
import User from '../models/User.js'
import Course from '../models/Course.js'
import { Purchase } from '../models/Purchase.js'



// ✅ Clerk Webhook Function
const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        })

        const { data, type } = req.body

        switch (type) {
            case 'user.created': {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url,
                }
                await User.create(userData)
                break
            }

            case 'user.updated': {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url,
                }
                await User.findByIdAndUpdate(data.id, userData)
                break
            }

            case 'user.deleted': {
                await User.findByIdAndDelete(data.id)
                break
            }

            default:
                break
        }

        res.json({})
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ✅ Stripe Webhook Function
const stripeWebhooks = async (req, res) => {
    const sig = req.headers['stripe-signature']
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    let event
    try {
        event = Stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    switch (event.type) {
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object
            const session = await stripe.checkout.sessions.list({
                payment_intent: paymentIntent.id
            })

            const { purchasedId } = session.data[0].metadata
            const purchaseData = await Purchase.findById(purchasedId)
            const userData = await User.findById(purchaseData.userId)
            const courseData = await Course.findById(purchaseData.courseId.toString())

            courseData.enrolledStudents.push(userData._id)
            await courseData.save()

            userData.enrolledCourses.push(courseData._id)
            await userData.save()

            purchaseData.status = 'completed'
            await purchaseData.save()

            break
        }

        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object
            const session = await stripe.checkout.sessions.list({
                payment_intent: paymentIntent.id
            })

            const { purchasedId } = session.data[0].metadata
            const purchaseData = await Purchase.findById(purchasedId)
            purchaseData.status = 'failed'
            await purchaseData.save()

            break
        }

        default:
            console.log(`Unhandled event type ${event.type}`)
    }

    res.json({ received: true })
}

// ✅ Final export (no duplicates)
export { clerkWebhooks, stripeWebhooks }
