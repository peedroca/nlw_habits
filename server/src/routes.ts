import dayjs from 'dayjs'
import { FastifyInstance } from "fastify"
import { z } from "zod"
import { prisma } from "./lib/prisma"

export async function appRoutes(app: FastifyInstance) {
    // CREATE HABIT
    app.post('/habits', async (req, res) => {
        const createHabitBody = z.object({
            title: z.string(),
            weekDays: z.array(
                z.number().min(0).max(6)
            )
        })
        
        const { title, weekDays } = createHabitBody.parse(req.body)

        const today = dayjs().startOf('day').toDate()

        await prisma.habit.create({
            data: {
                title,
                created_at: new Date(),
                weekDays: {
                    create: weekDays.map(weekday => {
                        return {
                            week_day: weekday
                        }
                    })
                }
            }
        })
    })

    // GET DAY HABITs
    app.get('/day',async (request) => {
        const getDayParams = z.object({
            date: z.coerce.date()
        })

        const { date } = getDayParams.parse(request.query)
        
        const parsedDate = dayjs(date).startOf('day')
        const weekDay = dayjs(date).get('day')

        const possibleHabits = await prisma.habit.findMany({
            where: {
                created_at: {
                    lte: date
                },
                weekDays: {
                    some: {
                        week_day: weekDay
                    }
                }
            }
        })

        const day = await prisma.day.findUnique({
            where: {
                date: parsedDate.toDate()
            },
            include: {
                dayHabits: true
            }
        })

        const completedHabits = day?.dayHabits.map(dayHabit => {
            return dayHabit.habit_id
        })

        return {
            possibleHabits,
            completedHabits
        }
    })

    app.patch('/habits/:id/toggle', async (req, res) => {
        const toggleHabbitParams = z.object({
            id: z.string().uuid(),
        })

        const { id } = toggleHabbitParams.parse(req.params)

        const today = dayjs().startOf('day').toDate()

        let day = await prisma.day.findUnique({ 
            where: {
                date: today
            }        
        })
        
        if (!day) {
            day = await prisma.day.create({
                data: {
                    date: today
                }
            })
        }

        const dayHabit = await prisma.dayHabit.findUnique({
            where: {
                day_id_habit_id: {
                    day_id: day.id,
                    habit_id: id
                }
            }
        })

        if (!dayHabit) {
            await prisma.dayHabit.create({
                data: {
                    day_id: day.id,
                    habit_id: id
                }
            })
        } else {
            await prisma.dayHabit.delete({ where: { id: dayHabit.id} })
        }
    })

    app.get('/summary', async () => {
        const summary = await prisma.$queryRaw`
            SELECT 
                D.id,
                D.date,
                (
                    SELECT 
                        CAST(COUNT(*) AS FLOAT)
                    FROM day_habits DH
                    WHERE DH.day_id = D.id 
                ) as completed,
                (
                    SELECT 
                        CAST(COUNT(*) AS FLOAT)
                    FROM habit_week_days HWD
                    JOIN habits H ON H.id = HWD.habit_id
                    WHERE HWD.week_day = CAST(strftime('%w', D.date/1000, 'unixepoch') AS INT) AND H.created_at <= D.date
                ) as amount
            FROM days D
            ORDER BY D.date
        `

        return summary
    })
}