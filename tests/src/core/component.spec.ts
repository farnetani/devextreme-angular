/* tslint:disable:component-selector */

import {
    Component,
    ElementRef,
    EventEmitter,
    ViewChildren,
    NgZone,
    Input,
    Output,
    QueryList,
    AfterViewInit,
    OnDestroy
} from '@angular/core';

import {
    TestBed,
    async
} from '@angular/core/testing';

import {
    DxComponent,
    DxTemplateHost,
    WatcherHelper
} from '../../../dist';

// TODO: Try to replace dxButton to Widget ('require' required)
import DxButton from 'devextreme/ui/button';
let DxTestWidget = DxButton['inherit']({
    _render() {
        this.callBase();
        this.element()[0].classList.add('dx-test-widget');
    }
});

@Component({
    selector: 'dx-test-widget',
    template: '',
    providers: [DxTemplateHost, WatcherHelper]
})
export class DxTestWidgetComponent extends DxComponent implements AfterViewInit, OnDestroy {
    @Input()
    get testOption(): any {
        return this._getOption('testOption');
    }
    set testOption(value: any) {
        this._setOption('testOption', value);
    };

    @Output() onOptionChanged = new EventEmitter<any>();
    @Output() onInitialized = new EventEmitter<any>();
    @Output() onDisposing = new EventEmitter<any>();
    @Output() onContentReady = new EventEmitter<any>();
    @Output() testOptionChange = new EventEmitter<any>();

    constructor(elementRef: ElementRef, ngZone: NgZone, templateHost: DxTemplateHost, _watcherHelper: WatcherHelper) {
        super(elementRef, ngZone, templateHost, _watcherHelper);

        this._events = [
            { subscribe: 'optionChanged', emit: 'onOptionChanged' },
            { subscribe: 'initialized', emit: 'onInitialized' },
            { subscribe: 'disposing', emit: 'onDisposing' },
            { subscribe: 'contentReady', emit: 'onContentReady' },
            { emit: 'testOptionChange' }
        ];
    }

    protected _createInstance(element, options) {
        return new DxTestWidget(element, options);
    }

    ngAfterViewInit() {
        this._createWidget(this.element.nativeElement);
    }

    ngOnDestroy() {
        this._destroyWidget();
    }
}

@Component({
    selector: 'test-container-component',
    template: ''
})
export class TestContainerComponent {
    visible: boolean = true;
    testOption: string;
    @ViewChildren(DxTestWidgetComponent) innerWidgets: QueryList<DxTestWidgetComponent>;
    testMethod() {
    }
}


describe('DevExtreme Angular 2 widget', () => {

    beforeEach(() => {
        TestBed.configureTestingModule(
            {
                declarations: [TestContainerComponent, DxTestWidgetComponent]
            });
    });

    function getWidget(fixture) {
        let widgetElement = fixture.nativeElement.querySelector('.dx-test-widget') || fixture.nativeElement;
        return DxTestWidget.getInstance(widgetElement);
    }

    // spec
    it('should be rendered', async(() => {
        TestBed.overrideComponent(TestContainerComponent, {
            set: {
                template: '<dx-test-widget [testOption]="\'Test Value\'" > </dx-test-widget>'
            }
        });
        let fixture = TestBed.createComponent(TestContainerComponent);
        fixture.detectChanges();

        let element = getWidget(fixture).element().get(0);

        expect(element.classList).toContain('dx-test-widget');

    }));

    it('should be disposed', async(() => {
        let testSpy = spyOn(TestContainerComponent.prototype, 'testMethod');

        TestBed.overrideComponent(TestContainerComponent, {
            set: {
                template: '<dx-test-widget *ngIf="visible" (onDisposing)="testMethod()"></dx-test-widget>'
            }
        });
        let fixture = TestBed.createComponent(TestContainerComponent);
        fixture.detectChanges();

        fixture.componentInstance.visible = false;
        fixture.detectChanges();

        expect(testSpy).toHaveBeenCalledTimes(1);
    }));

    it('should set testOption value to insatnce', async(() => {
        TestBed.overrideComponent(TestContainerComponent, {
            set: {
                template: '<dx-test-widget [testOption]="\'Test Value\'" > </dx-test-widget>'
            }
        });
        let fixture = TestBed.createComponent(TestContainerComponent);
        fixture.detectChanges();

        let outerComponent = fixture.componentInstance,
            innerComponent = outerComponent.innerWidgets.first,
            instance = getWidget(fixture);

        expect(instance.option('testOption')).toBe('Test Value');
        expect(innerComponent.testOption).toBe('Test Value');

    }));

    it('should change component option value', async(() => {
        let fixture = TestBed.createComponent(DxTestWidgetComponent);
        fixture.detectChanges();

        let component = fixture.componentInstance,
            instance = getWidget(fixture);

        instance.option('testOption', 'Changed');
        expect(component.testOption).toBe('Changed');

    }));

    it('should change instance option value', async(() => {
        TestBed.overrideComponent(TestContainerComponent, {
            set: {
                template: '<dx-test-widget [testOption]="testOption"></dx-test-widget>'
            }
        });
        let fixture = TestBed.createComponent(TestContainerComponent);
        fixture.detectChanges();

        let testComponent = fixture.componentInstance,
            instance = getWidget(fixture);

        testComponent.testOption = 'Changed 2';
        fixture.detectChanges();
        expect(instance.option('testOption')).toBe('Changed 2');

    }));

    it('should change instance option value by component option setter', async(() => {
        TestBed.overrideComponent(TestContainerComponent, {
            set: {
                template: '<dx-test-widget [testOption]="testOption"></dx-test-widget>'
            }
        });
        let fixture = TestBed.createComponent(TestContainerComponent);
        fixture.detectChanges();

        let testComponent = fixture.componentInstance.innerWidgets.first,
            instance = getWidget(fixture);

        testComponent.testOption = 'Changed 2';
        expect(instance.option('testOption')).toBe('Changed 2');

    }));

    it('should fire optionChanged event', async(() => {
        TestBed.overrideComponent(TestContainerComponent, {
            set: {
                template: '<dx-test-widget [testOption]="testOption" (onOptionChanged)="testMethod()"></dx-test-widget>'
            }
        });
        let fixture = TestBed.createComponent(TestContainerComponent);
        fixture.detectChanges();

        let testComponent = fixture.componentInstance,
            instance = getWidget(fixture);

        let testSpy = spyOn(testComponent, 'testMethod');
        testComponent.testOption = 'Changed 2';
        fixture.detectChanges();
        expect(instance.option('testOption')).toBe('Changed 2');
        expect(testSpy).toHaveBeenCalledTimes(1);

    }));

    it('should fire onInitialized event', async(() => {
        let testSpy = spyOn(TestContainerComponent.prototype, 'testMethod');
        TestBed.overrideComponent(TestContainerComponent, {
            set: {
                template: '<dx-test-widget (onInitialized)="testMethod()"></dx-test-widget>'
            }
        });

        let fixture = TestBed.createComponent(TestContainerComponent);
        fixture.detectChanges();
        expect(testSpy).toHaveBeenCalledTimes(1);

    }));

    it('should fire onContentReady event', async(() => {
        let testSpy = spyOn(TestContainerComponent.prototype, 'testMethod');
        TestBed.overrideComponent(TestContainerComponent, {
            set: {
                template: '<dx-test-widget (onContentReady)="testMethod()"></dx-test-widget>'
            }
        });

        let fixture = TestBed.createComponent(TestContainerComponent);
        fixture.detectChanges();
        expect(testSpy).toHaveBeenCalledTimes(1);

    }));

  });
