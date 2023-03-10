import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { BackButton } from "../components/BackButton";
import { Checkbox } from "../components/Checkbox";
import { Feather } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

const availableWeekDays = ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado']

export function New() {
    const [weekDays, setWeekDays] = useState<number[]>([])
    
    function handleToggleWeekDay(weekDayIndex: number) {
        if (weekDays.includes(weekDayIndex)) {
            setWeekDays(prevState => prevState.filter(weekDay => weekDay != weekDayIndex));
        } else {
            setWeekDays(prevState => [...prevState, weekDayIndex]);
        }
    }

    return (
        <View className="flex-1 bg-background px-8 pt-16">
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <BackButton />

                <Text className="text-white mt-6 font-extrabold text-3xl">
                    Criar hábito
                </Text>

                <Text className="text-white mt-6 font-semibold text-base">
                    Qual seu comprometimento?
                </Text>

                <TextInput 
                    className="h-12 pl-4 rounded-lg mt-3 bg-zinc-900 border-zinc-800 text-white border-2 focus:border-green-300"
                    placeholder="Exercícios, dormir bem, etc..."
                    placeholderTextColor={colors.zinc[400]}
                />

                <Text className="text-white mt-6 font-semibold text-base mb-3">
                    Qual a recorrência?
                </Text>

                {
                    availableWeekDays.map((weekDay, i) => (
                        <Checkbox 
                            key={weekDay}
                            title={weekDay}
                            checked={weekDays.includes(i)}
                            onPress={() => handleToggleWeekDay(i)}
                        />
                    ))
                }

                <TouchableOpacity
                    activeOpacity={0.7}
                    className="w-full h-14 flex-row items-center justify-center bg-green-600 rounded-md mt-6"
                >
                    <Feather
                        name="check"
                        size={20}
                        color={colors.white}
                    />
                    <Text 
                        className="font-semibold text-base text-white ml-2"
                    >
                        Confirmar
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}