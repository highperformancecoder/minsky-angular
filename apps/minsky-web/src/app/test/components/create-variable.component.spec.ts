import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CreateVariableComponent } from '../../components/menu/create-variable/create-variable.component'

describe('CreateVariableComponent', () => {
	let component: CreateVariableComponent
	let fixture: ComponentFixture<CreateVariableComponent>

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CreateVariableComponent],
		}).compileComponents()
	}))

	beforeEach(() => {
		fixture = TestBed.createComponent(CreateVariableComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})
})
