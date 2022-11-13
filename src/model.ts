export interface TWUMerchant {
  ID: number;
  Name: string;
  Tags: string;
  RequiresTag: boolean;
  Lines:  TWUMerchantLine[]
}

export interface TWUMerchantLine {
  // ID unique to the merchant
  ID: number;
  // ID of the item
  ItemID: number;
  // How many items for the price
  Count: number;
  // Price for Count items
  Price: number;
  // Does it buy?
  Buy: false;

  // Converted
  PriceGold?: number;
  PriceSilver?: number;
  PriceCopper?: number;

  // Support
  Item?: CEItem;
  Suggestions?: CEItem[];
}

export interface CEItem {
  ID: number;
  Name: string;
  StackSize: number;
  DLC: string;
}
