import { Component } from '@angular/core';
import {MessageService} from "primeng/api";
import {CEItem, TWUMerchant, TWUMerchantLine} from "../model";
import allItemData from "./itemdata.json";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'twu-merchant';
  displayLoadDialog = false;
  merchantDefinition = '';
  itemData: CEItem[] = [];

  merchant?: TWUMerchant;
  displayExport = false;

  constructor(private messageService: MessageService) {
    this.itemData = allItemData;
  }

  handleLoadClick() {
    this.displayLoadDialog = true;
  }

  handleLoadMerchant() {
    if (this.merchantDefinition !== '') {
      try {
        const def = JSON.parse(this.merchantDefinition);
        console.log(def);
        this.displayLoadDialog = false;
        this.merchantDefinition = '';
        this.merchant = def;
        this.merchant?.Lines.forEach(l => this.fillData(l))
      }
      catch (error) {
        this.messageService.add({severity: 'error', summary: 'Failed to load merchant'});
      }
    }
  }

  hasMerchantDef(): boolean {
    return this.merchantDefinition !== '';
  }

  getGold(product: TWUMerchantLine): number {
    return Math.floor(product.Price/10_000);
  }

  getSilver(product: TWUMerchantLine): number {
    const gold = this.getGold(product);
    const silverTotal = Math.floor(product.Price/100)
    console.log({gold, silverTotal});
    return silverTotal - (gold * 100);
  }

  getCopper(product: TWUMerchantLine): number {
    const gold = this.getGold(product);
    const silver = this.getSilver(product);
    return product.Price - ((gold * 10_000) + (silver * 100));
  }


  private fillData(product: TWUMerchantLine): void {
    product.PriceGold = this.getGold(product);
    product.PriceSilver = this.getSilver(product);
    product.PriceCopper = this.getCopper(product);
    product.Item = this.findItem(product);
  }

  private findItem(product: TWUMerchantLine): CEItem | undefined {
    return this.itemData
      .find(value => value.ID == product.ItemID);
  }

  handleExportClick(): void {
    this.displayExport = true;
  }

  getExportedMerchantDef(): string {
    if (this.merchant) {
      const copiedMerchant: TWUMerchant = {
        ...this.merchant,
        Lines: this.merchant?.Lines.map(l => this.exportLine(l)) || []
      };
      return JSON.stringify(copiedMerchant);
    }
    return '';
  }

  private exportLine(line: TWUMerchantLine): TWUMerchantLine {
    return {
      ItemID: line.Item?.ID || line.ItemID,
      ID: line.ID,
      Price: (line.PriceCopper || 0) + ((line.PriceSilver || 0) * 100) + ((line.PriceGold || 0) * 10_000),
      Count: line.Count,
      Buy: line.Buy
    }
  }

  filterTWUItemLine(event: any, line: TWUMerchantLine): void {
    //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
    let query = event.query.toLowerCase()
    line.Suggestions = this.itemData
      .filter(value => value.Name.toLowerCase().includes(query));
  }

  applySuggestionToLine($event: CEItem, product: TWUMerchantLine) {
    product.Item = $event;
    product.ItemID = $event.ID;
  }

  handleAddItem() {
    const newItem: TWUMerchantLine = {
      Item: undefined,
      ItemID: 0,
      Buy: false,
      Count: 1,
      Price: 0,
      PriceGold: 0,
      PriceSilver: 0,
      PriceCopper: 0,
      ID: getRandomInt(100_000_000, 999_999_999),
      Suggestions: []
    }
    if (this.merchant) {
      this.merchant.Lines = [
        ...this.merchant?.Lines,
        newItem
      ]
    }
  }

  deleteLine(product: TWUMerchantLine): void {
    if (this.merchant) {
      this.merchant = {
        ...this.merchant,
        Lines: this.merchant.Lines.filter(line => line.ID !== product.ID)
      }
    }
  }

  handleNewMerchant() {
    this.merchant = {
      ID: getRandomInt(100_000_000, 999_999_999),
      Lines: [],
      Name: 'New Merchant',
      RequiresTag: false,
      Tags: ""
    }
    this.handleAddItem();
  }
}

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
