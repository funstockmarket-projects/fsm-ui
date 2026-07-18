import { Component, signal, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Stock {
  symbol: string;
  name: string;
  buyPrice?: number;
  currentPrice: number;
  change: number;
  type: 'Portfolio' | 'Watchlist';
}
interface MarketIndex {
  name: string;
  value: string;
  change: number;
  isPositive: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Fun Market';


  // Add this to your component class
  ngOnInit() {
    document.addEventListener('click', (event: MouseEvent) => {
      const navLinks = document.getElementById('nav-links');
      const hamburgerBtn = document.getElementById('hamburger-btn');
      const target = event.target as HTMLElement;

      // Check if the menu is active and the click is NOT inside the nav or the hamburger button
      if (navLinks?.classList.contains('active') && 
          !navLinks.contains(target) && 
          !hamburgerBtn?.contains(target)) {
        navLinks.classList.remove('active');
      }
    });
  }

// --- Modals and UI State Management ---
  showSignIn = signal<boolean>(false);
  showSignUp = signal<boolean>(false);
  showAddStock = signal<boolean>(false);
  showProtoNotice = signal<boolean>(true);
  isLoggedIn = signal<boolean>(false);
  
  // Custom Center Screen Modal Error State
  showFormError = signal<string | null>(null);

  // --- Dynamic Live Market Ticker Signal ---
  marketIndices = signal<MarketIndex[]>([
    { name: 'NIFTY 50', value: '24,320.50', change: 0.45, isPositive: true },
    { name: 'BANK NIFTY', value: '52,180.20', change: 0.82, isPositive: true },
    { name: 'SENSEX', value: '79,850.10', change: -0.21, isPositive: false },
    { name: 'FINNIFTY', value: '23,910.45', change: 0.61, isPositive: true },
    { name: 'INDIA VIX', value: '12.85', change: -3.40, isPositive: false }
  ]);

  // --- Mockup Asset Records Data Store ---
  stocks = signal<Stock[]>([
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', buyPrice: 2450.00, currentPrice: 2520.50, change: 2.87, type: 'Portfolio' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', buyPrice: 3850.00, currentPrice: 3790.20, change: -1.55, type: 'Portfolio' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', buyPrice: 1420.00, currentPrice: 1465.10, change: 3.17, type: 'Portfolio' }
  ]);

  // --- Form Controls Bound Variables ---
  newStockSymbol = signal<string>('');
  newStockName = signal<string>('');
  newStockBuyPrice = signal<number | null>(null);
  newStockCurrentPrice = signal<number | null>(null);
  newStockType = signal<'Portfolio' | 'Watchlist'>('Portfolio');

  // ==================== KEYBOARD CONTROLLER LISTENERS ====================
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Only intercept keys if the developer notice modal is active
    if (this.showProtoNotice()) {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        // Prevent default browser behavior (like page scrolling on spacebar)
        event.preventDefault(); 
        this.closeNotice();
      }
    }
    
    // Fallback closure for validation error modal on keys
    if (this.showFormError()) {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.closeErrorModal();
      }
    }
  }

  // --- View Controller Functions ---
  toggleSignIn(state: boolean) {
    this.showSignIn.set(state);
    if (state) this.showSignUp.set(false);
  }

  toggleSignUp(state: boolean) {
    this.showSignUp.set(state);
    if (state) this.showSignIn.set(false);
  }

  toggleAddStock(state: boolean) {
    if (state && !this.isLoggedIn()) {
      this.toggleSignIn(true);
    } else {
      this.showAddStock.set(state);
    }
  }

  closeNotice() {
    this.showProtoNotice.set(false);
  }

  closeErrorModal() {
    this.showFormError.set(null);
  }

  // --- Backend Emulation Save Submissions ---
  handleAddStockSubmit() {
    if (!this.newStockSymbol() || !this.newStockName() || !this.newStockCurrentPrice()) {
      this.showFormError.set('Please fill out all required fields marked with an asterisk (*).');
      return;
    }

    const newStock: Stock = {
      symbol: this.newStockSymbol().toUpperCase(),
      name: this.newStockName(),
      buyPrice: this.newStockType() === 'Portfolio' ? (this.newStockBuyPrice() || undefined) : undefined,
      currentPrice: this.newStockCurrentPrice() || 0,
      change: 0.00,
      type: this.newStockType()
    };

    this.stocks.update(currentStocks => [...currentStocks, newStock]);
    this.resetForm();
    this.toggleAddStock(false);
  }

  private resetForm() {
    this.newStockSymbol.set('');
    this.newStockName.set('');
    this.newStockBuyPrice.set(null);
    this.newStockCurrentPrice.set(null);
    this.newStockType.set('Portfolio');
  }
  // Add these inside your AppComponent class logic
  onSignInSubmit(form: any): void {
    if (form.valid) {
      this.toggleSignIn(false);
      this.isLoggedIn.set(true);

      console.log("login values", form.value)
    }
  }

  onSignUpSubmit(form: any): void {
    if (form.valid) {
      this.showSignUp.set(false);
      this.toggleSignIn(false);
      this.isLoggedIn.set(true);
    }
  }

  // Add this inside your component class
  toggleMobileMenu() {
    const nav = document.getElementById('nav-links');
    if (nav) {
      nav.classList.toggle('active');
    }
  }
}