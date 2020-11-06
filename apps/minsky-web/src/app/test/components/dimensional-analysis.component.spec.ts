import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DimensionalAnalysisComponent } from '../../components/menu/file/dimensional-analysis/dimensional-analysis.component'

describe('DimensionalAnalysisComponent', () => {
	let component: DimensionalAnalysisComponent
	let fixture: ComponentFixture<DimensionalAnalysisComponent>

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [DimensionalAnalysisComponent],
		}).compileComponents()
	}))

	beforeEach(() => {
		fixture = TestBed.createComponent(DimensionalAnalysisComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})
})
