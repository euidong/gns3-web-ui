import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxModule, MatIconModule, MatToolbarModule, MatMenuModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PreferencesComponent } from './preferences.component';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

describe('SettingsComponent', () => {
    let component: PreferencesComponent;
    let fixture: ComponentFixture<PreferencesComponent>;
  
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [MatIconModule, MatToolbarModule, MatMenuModule, MatCheckboxModule, CommonModule, NoopAnimationsModule, RouterTestingModule.withRoutes([])],
        providers: [
            {
                provide: ActivatedRoute,  useValue: {
                    params: Observable.of({ id: 3 }),
                    snapshot: {
                        parent: {
                            params: {
                                id: 1
                            }
                        },
                        paramMap: {
                            get(name: string): string {
                                return '1';
                            }
                        }
                    },
                }
            }
        ],
        declarations: [
            PreferencesComponent
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
    }));
  
    beforeEach(() => {
      fixture = TestBed.createComponent(PreferencesComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should save correct server id', () => {
        expect(component.serverId).toBe('1');
    });
});
