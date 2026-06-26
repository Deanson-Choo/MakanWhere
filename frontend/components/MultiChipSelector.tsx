import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
    options: string[];
    selectedOptions: string[];
    setSelectedOptions: (option: string[]) => void;
};

export default function MultiChipSelector({ options, selectedOptions, setSelectedOptions }: Props) {
    return (
        <View style={styles.row}>
            {options.map((opt) => (
                <TouchableOpacity key={opt} style={selectedOptions.includes(opt) ? [styles.chip, styles.chipSelected] : styles.chip} onPress={() => {
                    if (selectedOptions.includes(opt)) {
                        // If the option is already selected, remove it from the selectedOptions array
                        setSelectedOptions(selectedOptions.filter((o) => o !== opt));
                    } else {
                        // If the option is not selected, add it to the selectedOptions array
                        setSelectedOptions([...selectedOptions, opt]);
                    }
                }}>
                    <Text style={selectedOptions.includes(opt) ? [styles.chipText, styles.chipTextSelected] : styles.chipText}>{opt}</Text>
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
