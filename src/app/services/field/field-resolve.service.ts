import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { FieldService } from './field.service';
import { Field } from '../../models/field/field';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FieldResolveService implements Resolve<Field[]> {

  constructor(private fieldService: FieldService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Field[]> | Field[] {
   //return this.fieldService.get();
    //return [{ Id: 'x', Name: 'Soli' }, { Id: 'x', Name: 'Soli' }]
    return this.fieldService.get();
  }
}
