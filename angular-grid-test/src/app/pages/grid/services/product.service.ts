import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Product } from "../models/product.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private apiURL = 'http://localhost:4040/products'; // Should be env var API_URL

  getProducts(skusToFilter: string[]): Observable<Product[]> {
    const products = this.http.get<Product[]>(this.apiURL, {
      params: {
        sku: skusToFilter,
      }
    });
    return products;
  }
}
