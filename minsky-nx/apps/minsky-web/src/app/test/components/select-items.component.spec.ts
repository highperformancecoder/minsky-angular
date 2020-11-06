import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SelectItemsComponent } from '../../components/menu/file/select-items/select-items.component'

describe('SelectItemsComponent', () => {
	let component: SelectItemsComponent
	let fixture: ComponentFixture<SelectItemsComponent>

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SelectItemsComponent],
		}).compileComponents()
	}))

	beforeEach(() => {
		fixture = TestBed.createComponent(SelectItemsComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})
})
