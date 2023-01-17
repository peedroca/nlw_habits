interface HabitProps {
    completed: number
}

export function Habit(props: HabitProps) {
    return (
        <p className="bg-zinc-900 h-10 w-10 m-2 rounded flex items-center justify-center text-white">{props.completed}</p>
    )
}