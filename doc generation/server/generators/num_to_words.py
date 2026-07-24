def amount_to_words(amount: float) -> str:
    """Converts amount to Indian Currency words (e.g. 42480 -> Forty Two Thousand Four Hundred Eighty Only)"""
    units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
             "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
    tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

    def num_to_text(n: int) -> str:
        if n < 20:
            return units[n]
        elif n < 100:
            return tens[n // 10] + (" " + units[n % 10] if n % 10 != 0 else "")
        elif n < 1000:
            return units[n // 100] + " Hundred" + (" " + num_to_text(n % 100) if n % 100 != 0 else "")
        elif n < 100000:
            return num_to_text(n // 1000) + " Thousand" + (" " + num_to_text(n % 1000) if n % 1000 != 0 else "")
        elif n < 10000000:
            return num_to_text(n // 100000) + " Lakh" + (" " + num_to_text(n % 100000) if n % 100000 != 0 else "")
        else:
            return num_to_text(n // 10000000) + " Crore" + (" " + num_to_text(n % 10000000) if n % 10000000 != 0 else "")

    rupees = int(amount)
    paise = round((amount - rupees) * 100)

    res = num_to_text(rupees) if rupees > 0 else "Zero"
    res += " Only"
    if paise > 0:
        res += f" and {num_to_text(paise)} Paise"
    
    # Capitalize appropriately
    return res
