import { Component, OnDestroy, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-factory',
  templateUrl: './factory.component.html',
  styleUrls: ['./factory.component.css'],
})
export class FactoryComponent implements OnInit, OnDestroy {

  factories: [];

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private apollo: Apollo) {
  }

  ngOnInit() {
    console.log('factory init');

    // emits on update (server push)
    this.apollo.subscribe<any>({
      query: gql`subscription getAllFactoriesSub {
        factory {
          id,
          name
        }
      }`,
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe(res => this.factories = res.data.factory);
  }

  ngOnDestroy() {
    console.log('factory destroy');
    this.destroy$.next();
    this.destroy$.complete();
  }

}
