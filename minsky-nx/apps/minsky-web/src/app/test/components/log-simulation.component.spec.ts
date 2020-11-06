import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LogSimulationComponent } from '../../components/menu/file/log-simulation/log-simulation.component'

describe('LogSimulationComponent', () => {
	let component: LogSimulationComponent
	let fixture: ComponentFixture<LogSimulationComponent>

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [LogSimulationComponent],
		}).compileComponents()
	}))

	beforeEach(() => {
		fixture = TestBed.createComponent(LogSimulationComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})
})
