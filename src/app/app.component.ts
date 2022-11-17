import {Component, HostListener} from '@angular/core';
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
  isHotkeysVisible = false;

  constructor(private messageService: MessageService) {
    this.itemData = allItemData.map(raw => {
      return {
        ID: raw.ID,
        Name: raw.Name,
        DLC: raw.DLC,
        StackSize: Number.parseInt(raw.StackSize)
      }
    })
  }

  @HostListener('window:keyup', ['$event'])
  public onGlobalKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && event.shiftKey) {
      const newLine = this.handleAddItem();
      this.focusLine(newLine);
    }
  }

  private focusLine(line?: TWUMerchantLine): void {
    // Autofocus
    const idToFocus: string = `input-product-row-${line?.ID}`;
    setTimeout(() => {
      document.getElementById(idToFocus)?.focus();
    }, 50)
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

  handleAddItem(): TWUMerchantLine | undefined {
    if (this.merchant) {
      const newItem: TWUMerchantLine = {
        Item: undefined,
        ItemID: "0",
        Buy: false,
        Count: 1,
        Price: 0,
        PriceGold: 0,
        PriceSilver: 0,
        PriceCopper: 0,
        ID: getRandomId(),
        Suggestions: []
      }
      this.addItem(newItem);
      return newItem
    }
    return undefined;
  }

  private addItem(newLine: TWUMerchantLine) {
    if (this.merchant) {
      this.merchant.Lines = [
        ...this.merchant?.Lines,
        newLine
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
      ID: getRandomId(),
      Lines: [],
      Name: 'New Merchant',
      RequiresTag: false,
      Tags: ""
    }
    this.handleAddItem();
  }

  handleSortMerchant() {
    if (this.merchant) {
      const copy = [...(this.merchant?.Lines || [])]
      copy.sort(compareByName);
      this.merchant.Lines = copy;
    }
  }

  duplicateLine(product: TWUMerchantLine) {
    const newItem: TWUMerchantLine = {
      ...product,
      ID: getRandomId()
    };
    this.addItem(newItem);
  }

  handleRowKeyUp(event: KeyboardEvent, product: TWUMerchantLine) {
    if (event.key === 'Delete' && event.shiftKey && this.merchant) {
      this.deleteLine(product);
      if (this.merchant.Lines.length >= 1) {
        const lastProduct = this.merchant.Lines[this.merchant.Lines.length - 1];
        this.focusLine(lastProduct);
      }
    }
  }

  showHotkeys(): void {
    this.isHotkeysVisible = true;
  }
}

function compareByName(a: TWUMerchantLine, b: TWUMerchantLine) {
  const nameA = (a.Item?.Name || '').toLowerCase();
  const nameB = (b.Item?.Name || '').toLowerCase();
  return nameA.localeCompare(nameB);
}

function getRandomId() {
  return getRandomInt(100000000, 900000000);
}

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
