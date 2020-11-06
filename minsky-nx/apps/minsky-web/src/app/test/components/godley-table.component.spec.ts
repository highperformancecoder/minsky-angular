import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GodleyTableComponent } from '../../components/menu/insert/godley-table/godley-table.component'

describe('GodleyTableComponent', () => {
	let component: GodleyTableComponent
	let fixture: ComponentFixture<GodleyTableComponent>

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [GodleyTableComponent],
		}).compileComponents()
	}))

	beforeEach(() => {
		fixture = TestBed.createComponent(GodleyTableComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})
})
