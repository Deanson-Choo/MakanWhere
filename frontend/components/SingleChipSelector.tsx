import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
    options: string[];
    selectedOption: string;
    setSelectedOption: (option: string) => void;
};

export default function SingleChipSelector({ options, selectedOption, setSelectedOption }: Props) {
    return (
        <View style={styles.row}>
            {options.map((opt) => (
                <TouchableOpacity key={opt} style={selectedOption === opt ? [styles.chip, styles.chipSelected] : styles.chip} onPress={() => setSelectedOption(selectedOption === opt ? '' : opt)}>
                    <Text style={selectedOption === opt ? [styles.chipText, styles.chipTextSelected] : styles.chipText}>{opt}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 10,
    },
    chip: {
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#ccc',
        paddingHorizontal: 16,
        paddingVertical: 7,
    },
    chipSelected: {
        backgroundColor: '#ffa200',
        borderColor: '#ffa200',
    },
    chipText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    chipTextSelected: {
        color: 'white',
        fontWeight: '700',
    },
});
