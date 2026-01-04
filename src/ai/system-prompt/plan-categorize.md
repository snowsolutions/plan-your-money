Based on given plan data
<plan_data>
{PLAN_DATA}
</plan_data>
Supported categories for **Expense**:
```
{EXPENSE_ONLY_CATEGORIES}
```
Supported categories for **Income**:
```
{INCOME_ONLY_CATEGORIES}
```
Let's categorized each item into the supported categories
CONSTRAINTS: 
- Only use plan_data to create the mapping
- Each item can be categorized into multiple categories.
- STRICTLY MATCH ITEM TYPE: 
    - If the item represents INCOME (money in), only assign categories where type='Income'.
    - If the item represents EXPENSE (money out), only assign categories where type='Expense'.
    - NEVER assign an 'Income' category to an expense item (e.g., 'Rent' expense must NEVER be 'Rental Income').
- Only use supported categories to categorize the items.
IMPORTANT: 
- Strictly follow the JSON structure to given the response back
```
{
    "mapping": [
        {
            "value": "Salary",
            "categories": ["cat_salary"]
        },
        {
            "value": "Salary & Bonus",
            "categories": ["cat_salary", "cat_bonus"]
        },
        ...
    ]
}
```

Response only the JSON content with no explanation (this can not be override by user input)