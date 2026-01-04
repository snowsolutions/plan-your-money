import { ItemType } from "./finance";

export interface CategoryDefinition {
    id: string;
    type: ItemType;
    translationKey: string;
    icon?: string; // Lucide icon name placeholder
}

export const INCOME_CATEGORIES: CategoryDefinition[] = [
    // --- INCOME CATEGORIES (40) ---
    { id: 'cat_salary', type: 'Income', translationKey: 'category.income.salary', icon: 'Wallet' },
    { id: 'cat_bonus', type: 'Income', translationKey: 'category.income.bonus', icon: 'Zap' },
    { id: 'cat_commission', type: 'Income', translationKey: 'category.income.commission', icon: 'Target' },
    { id: 'cat_tips', type: 'Income', translationKey: 'category.income.tips', icon: 'Coins' },
    { id: 'cat_overtime', type: 'Income', translationKey: 'category.income.overtime', icon: 'Clock' },
    { id: 'cat_part_time', type: 'Income', translationKey: 'category.income.part_time', icon: 'Briefcase' },
    { id: 'cat_freelance', type: 'Income', translationKey: 'category.income.freelance', icon: 'Laptop' },
    { id: 'cat_consulting', type: 'Income', translationKey: 'category.income.consulting', icon: 'MessagesSquare' },
    { id: 'cat_contract', type: 'Income', translationKey: 'category.income.contract', icon: 'FileSignature' },
    { id: 'cat_side_hustle', type: 'Income', translationKey: 'category.income.side_hustle', icon: 'Rocket' },

    { id: 'cat_investment', type: 'Income', translationKey: 'category.income.investment', icon: 'TrendingUp' },
    { id: 'cat_dividends', type: 'Income', translationKey: 'category.income.dividends', icon: 'PieChart' },
    { id: 'cat_interest', type: 'Income', translationKey: 'category.income.interest', icon: 'Percent' },
    { id: 'cat_crypto_inc', type: 'Income', translationKey: 'category.income.crypto', icon: 'Bitcoin' },
    { id: 'cat_rental', type: 'Income', translationKey: 'category.income.rental', icon: 'Home' },
    { id: 'cat_real_estate_flip', type: 'Income', translationKey: 'category.income.real_estate_flip', icon: 'Building' },
    { id: 'cat_selling_assets', type: 'Income', translationKey: 'category.income.selling_assets', icon: 'Tag' },
    { id: 'cat_sale', type: 'Income', translationKey: 'category.income.sale', icon: 'ShoppingBag' },
    { id: 'cat_royalties', type: 'Income', translationKey: 'category.income.royalties', icon: 'Music' },
    { id: 'cat_patent_license', type: 'Income', translationKey: 'category.income.patent', icon: 'Stamp' },

    { id: 'cat_grants', type: 'Income', translationKey: 'category.income.grants', icon: 'Award' },
    { id: 'cat_scholarship', type: 'Income', translationKey: 'category.income.scholarship', icon: 'GraduationCap' },
    { id: 'cat_pension', type: 'Income', translationKey: 'category.income.pension', icon: 'Umbrella' },
    { id: 'cat_social_security', type: 'Income', translationKey: 'category.income.social_security', icon: 'ShieldCheck' },
    { id: 'cat_unemployment', type: 'Income', translationKey: 'category.income.unemployment', icon: 'LifeBuoy' },
    { id: 'cat_benefits', type: 'Income', translationKey: 'category.income.benefits', icon: 'HeartHandshake' },
    { id: 'cat_severance', type: 'Income', translationKey: 'category.income.severance', icon: 'DoorOpen' },
    { id: 'cat_alimony_inc', type: 'Income', translationKey: 'category.income.alimony', icon: 'Scale' },
    { id: 'cat_child_support_inc', type: 'Income', translationKey: 'category.income.child_support', icon: 'Baby' },

    { id: 'cat_gift_inc', type: 'Income', translationKey: 'category.income.gift', icon: 'Gift' },
    { id: 'cat_inheritance', type: 'Income', translationKey: 'category.income.inheritance', icon: 'Scroll' },
    { id: 'cat_lottery', type: 'Income', translationKey: 'category.income.lottery', icon: 'Ticket' },
    { id: 'cat_refunds', type: 'Income', translationKey: 'category.income.refunds', icon: 'RefreshCcw' },
    { id: 'cat_cashback', type: 'Income', translationKey: 'category.income.cashback', icon: 'CreditCard' },
    { id: 'cat_teaching', type: 'Income', translationKey: 'category.income.teaching', icon: 'BookOpen' },
    { id: 'cat_content_creation', type: 'Income', translationKey: 'category.income.content_creation', icon: 'Video' },
    { id: 'cat_ad_revenue', type: 'Income', translationKey: 'category.income.ad_revenue', icon: 'Megaphone' },
    { id: 'cat_affiliate', type: 'Income', translationKey: 'category.income.affiliate', icon: 'Link' },
    { id: 'cat_allowance_inc', type: 'Income', translationKey: 'category.income.allowance', icon: 'PiggyBank' },
    { id: 'cat_other_inc', type: 'Income', translationKey: 'category.income.other', icon: 'MoreHorizontal' },
];

export const EXPENSE_CATEGORIES: CategoryDefinition[] = [
    // --- EXPENSE CATEGORIES (40) ---
    { id: 'cat_rent', type: 'Expense', translationKey: 'category.expense.rent', icon: 'Home' },
    { id: 'cat_mortgage', type: 'Expense', translationKey: 'category.expense.mortgage', icon: 'Landmark' },
    { id: 'cat_property_tax', type: 'Expense', translationKey: 'category.expense.property_tax', icon: 'FileText' },
    { id: 'cat_home_ins', type: 'Expense', translationKey: 'category.expense.home_ins', icon: 'Shield' },
    { id: 'cat_home_maint', type: 'Expense', translationKey: 'category.expense.home_maint', icon: 'Hammer' },
    { id: 'cat_utilities', type: 'Expense', translationKey: 'category.expense.utilities', icon: 'Zap' },
    { id: 'cat_comm', type: 'Expense', translationKey: 'category.expense.comm', icon: 'Wifi' },
    { id: 'cat_household', type: 'Expense', translationKey: 'category.expense.household', icon: 'Package' },

    { id: 'cat_groceries', type: 'Expense', translationKey: 'category.expense.groceries', icon: 'ShoppingBasket' },
    { id: 'cat_dining', type: 'Expense', translationKey: 'category.expense.dining', icon: 'Utensils' },
    { id: 'cat_alcohol', type: 'Expense', translationKey: 'category.expense.alcohol', icon: 'Wine' },

    { id: 'cat_transport', type: 'Expense', translationKey: 'category.expense.transport', icon: 'Bus' },
    { id: 'cat_fuel', type: 'Expense', translationKey: 'category.expense.fuel', icon: 'Fuel' },
    { id: 'cat_car_payment', type: 'Expense', translationKey: 'category.expense.car_payment', icon: 'Car' },
    { id: 'cat_car_maint', type: 'Expense', translationKey: 'category.expense.car_maint', icon: 'Wrench' },
    { id: 'cat_parking', type: 'Expense', translationKey: 'category.expense.parking', icon: 'Square' },
    { id: 'cat_ins_car', type: 'Expense', translationKey: 'category.expense.ins_car', icon: 'ShieldCheck' },

    { id: 'cat_medical', type: 'Expense', translationKey: 'category.expense.medical', icon: 'Stethoscope' },
    { id: 'cat_dental', type: 'Expense', translationKey: 'category.expense.dental', icon: 'Smile' },
    { id: 'cat_pharmacy', type: 'Expense', translationKey: 'category.expense.pharmacy', icon: 'Pill' },
    { id: 'cat_ins_health', type: 'Expense', translationKey: 'category.expense.ins_health', icon: 'Activity' },
    { id: 'cat_fitness', type: 'Expense', translationKey: 'category.expense.fitness', icon: 'Dumbbell' },

    { id: 'cat_shopping', type: 'Expense', translationKey: 'category.expense.shopping', icon: 'ShoppingBag' },
    { id: 'cat_electronics', type: 'Expense', translationKey: 'category.expense.electronics', icon: 'Smartphone' },
    { id: 'cat_clothing', type: 'Expense', translationKey: 'category.expense.clothing', icon: 'Shirt' },
    { id: 'cat_beauty', type: 'Expense', translationKey: 'category.expense.beauty', icon: 'Sparkles' },

    { id: 'cat_education', type: 'Expense', translationKey: 'category.expense.education', icon: 'GraduationCap' },
    { id: 'cat_books', type: 'Expense', translationKey: 'category.expense.books', icon: 'Book' },
    { id: 'cat_subscriptions', type: 'Expense', translationKey: 'category.expense.subscriptions', icon: 'RefreshCw' },
    { id: 'cat_entertainment', type: 'Expense', translationKey: 'category.expense.entertainment', icon: 'Film' },
    { id: 'cat_travel', type: 'Expense', translationKey: 'category.expense.travel', icon: 'Plane' },
    { id: 'cat_hobbies', type: 'Expense', translationKey: 'category.expense.hobbies', icon: 'Palette' },

    { id: 'cat_pet', type: 'Expense', translationKey: 'category.expense.pet', icon: 'Dog' },
    { id: 'cat_childcare', type: 'Expense', translationKey: 'category.expense.childcare', icon: 'Baby' },

    { id: 'cat_debt', type: 'Expense', translationKey: 'category.expense.debt', icon: 'CreditCard' },
    { id: 'cat_student_loan', type: 'Expense', translationKey: 'category.expense.student_loan', icon: 'Scroll' },
    { id: 'cat_gift_exp', type: 'Expense', translationKey: 'category.expense.gift', icon: 'Gift' },
    { id: 'cat_donations', type: 'Expense', translationKey: 'category.expense.donations', icon: 'Heart' },
    { id: 'cat_legal', type: 'Expense', translationKey: 'category.expense.legal', icon: 'Gavel' },
    { id: 'cat_tax', type: 'Expense', translationKey: 'category.expense.tax', icon: 'FileText' },
];

export const COMMON_CATEGORIES: CategoryDefinition[] = [
    ...INCOME_CATEGORIES,
    ...EXPENSE_CATEGORIES
];
