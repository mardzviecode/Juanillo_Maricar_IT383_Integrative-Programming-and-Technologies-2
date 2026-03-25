import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
}

export interface CartLine {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

const CART_STORAGE_KEY = 'whiskerWonderlandCart';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  readonly products: ShopProduct[] = [
    {
      id: 'bed',
      name: 'Cozy Cat Bed',
      description: 'Soft, warm bed for naps',
      price: 899,
      emoji: '🛏️'
    },
    {
      id: 'yarn',
      name: 'Jumbo Ball of Yarn',
      description: 'Classic toy cats love',
      price: 299,
      emoji: '🧶'
    },
    {
      id: 'food',
      name: 'Premium Cat Food',
      description: 'Grain-free, 2kg bag',
      price: 1199,
      emoji: '🐟'
    },
    {
      id: 'post',
      name: 'Scratching Post',
      description: 'Sisal, 60cm tall',
      price: 1499,
      emoji: '🪵'
    },
    {
      id: 'cave',
      name: 'Cat Cave',
      description: 'Cozy hideaway nest',
      price: 699,
      emoji: '🪺'
    },
    {
      id: 'treats',
      name: 'Treats Bundle',
      description: 'Natural salmon & chicken',
      price: 449,
      emoji: '🍗'
    }
  ];

  cartLines: CartLine[] = [];
  checkoutNotice = '';

  constructor(private router: Router) {
    this.loadCart();
  }

  get cartItemCount(): number {
    return this.cartLines.reduce((sum, line) => sum + line.quantity, 0);
  }

  get cartTotal(): number {
    return this.cartLines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  }

  formatPeso(value: number): string {
    return `₱${value.toLocaleString('en-PH')}`;
  }

  private loadCart(): void {
    try {
      const raw = sessionStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;
      this.cartLines = parsed.filter(
        (row): row is CartLine =>
          row &&
          typeof row === 'object' &&
          typeof (row as CartLine).productId === 'string' &&
          typeof (row as CartLine).name === 'string' &&
          typeof (row as CartLine).unitPrice === 'number' &&
          typeof (row as CartLine).quantity === 'number' &&
          (row as CartLine).quantity > 0
      );
    } catch {
      this.cartLines = [];
    }
  }

  private persistCart(): void {
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cartLines));
  }

  addToCart(product: ShopProduct): void {
    this.checkoutNotice = '';
    const existing = this.cartLines.find((l) => l.productId === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cartLines = [
        ...this.cartLines,
        {
          productId: product.id,
          name: product.name,
          unitPrice: product.price,
          quantity: 1
        }
      ];
    }
    this.persistCart();
  }

  increment(line: CartLine): void {
    this.checkoutNotice = '';
    line.quantity += 1;
    this.persistCart();
  }

  decrement(line: CartLine): void {
    this.checkoutNotice = '';
    line.quantity -= 1;
    if (line.quantity <= 0) {
      this.removeLine(line);
      return;
    }
    this.persistCart();
  }

  removeLine(line: CartLine): void {
    this.checkoutNotice = '';
    this.cartLines = this.cartLines.filter((l) => l !== line);
    this.persistCart();
  }

  clearCart(): void {
    this.checkoutNotice = '';
    this.cartLines = [];
    this.persistCart();
  }

  placeOrder(): void {
    if (!this.cartLines.length) return;
    const total = this.cartTotal;
    this.checkoutNotice = `Order placed (demo): ${this.cartItemCount} item(s), total ${this.formatPeso(total)}. Thank you!`;
    this.cartLines = [];
    this.persistCart();
  }

  logout(): void {
    this.router.navigate(['/']);
  }
}
