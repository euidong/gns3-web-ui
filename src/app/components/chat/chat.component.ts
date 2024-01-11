import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ResizeEvent } from 'angular-resizable-element';
import { LinksDataSource } from 'app/cartography/datasources/links-datasource';
import { NodesDataSource } from 'app/cartography/datasources/nodes-datasource';
import { Subscription } from 'rxjs';
import { Node } from '../../cartography/models/node';
import { Link } from '../../models/link';
import { Project } from '../../models/project';
import { Server } from '../../models/server';
import { ProjectService } from '../../services/project.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ChatComponent implements OnInit {
  @Input() server: Server;
  @Input() project: Project;

  @Output() closeChat = new EventEmitter<boolean>();

  public style = {};
  public bodyStyle = {};
  private subscriptions: Subscription[] = [];

  public inputValue: string;

  nodes: Node[] = [];
  links: Link[] = [];
  messages = [];

  isTopologyVisible: boolean = true;
  isDraggingEnabled: boolean = false;
  isLightThemeEnabled: boolean = false;

  constructor(
    private nodeDataSource: NodesDataSource,
    private projectService: ProjectService,
    private linksDataSource: LinksDataSource,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.themeService.getActualTheme() === 'light'
      ? (this.isLightThemeEnabled = true)
      : (this.isLightThemeEnabled = false);

    this.subscriptions.push(
      this.nodeDataSource.changes.subscribe((nodes: Node[]) => {
        this.nodes = nodes;
        this.nodes.forEach((n) => {
          if (n.console_host === '0.0.0.0' || n.console_host === '0:0:0:0:0:0:0:0' || n.console_host === '::') {
            n.console_host = this.server.host;
          }
        });
      })
    );

    this.subscriptions.push(
      this.linksDataSource.changes.subscribe((links: Link[]) => {
        this.links = links;
      })
    );

    this.revertPosition();
  }

  revertPosition() {
    let leftPosition = localStorage.getItem('chatLeftPosition');
    let rightPosition = localStorage.getItem('chatRightPosition');
    let topPosition = localStorage.getItem('chatTopPosition');
    let widthOfWidget = localStorage.getItem('chatWidthOfWidget');
    let heightOfWidget = localStorage.getItem('chatHeightOfWidget');

    if (!topPosition) {
      this.style = { bottom: '30px', right: '0px', width: '320px', height: '300px' };
      this.bodyStyle = { height: '205px' };
    } else {
      this.style = {
        position: 'fixed',
        left: `${+leftPosition}px`,
        right: `${+rightPosition}px`,
        top: `${+topPosition}px`,
        width: `${+widthOfWidget}px`,
        height: `${+heightOfWidget}px`,
      };
      this.bodyStyle = { height: `${+heightOfWidget - 95}px` };
    }
  }

  toggleDragging(value: boolean) {
    this.isDraggingEnabled = value;
  }

  dragWidget(event) {
    let x: number = Number(event.movementX);
    let y: number = Number(event.movementY);

    let width: number = Number(this.style['width'].split('px')[0]);
    let height: number = Number(this.style['height'].split('px')[0]);
    let top: number = Number(this.style['top'].split('px')[0]) + y;

    if (this.style['left']) {
      let left: number = Number(this.style['left'].split('px')[0]) + x;
      this.style = {
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
      };

      localStorage.setItem('chatLeftPosition', left.toString());
      localStorage.setItem('chatTopPosition', top.toString());
      localStorage.setItem('chatWidthOfWidget', width.toString());
      localStorage.setItem('chatHeightOfWidget', height.toString());
    } else {
      let left: number = Number(this.style['right'].split('px')[0]) - x;
      this.style = {
        position: 'fixed',
        right: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
      };

      localStorage.setItem('chatRightPosition', left.toString());
      localStorage.setItem('chatTopPosition', top.toString());
      localStorage.setItem('chatWidthOfWidget', width.toString());
      localStorage.setItem('chatHeightOfWidget', height.toString());
    }
  }

  validate(event: ResizeEvent): boolean {
    if (
      event.rectangle.width &&
      event.rectangle.height &&
      (event.rectangle.width < 290 || event.rectangle.height < 260)
    ) {
      return false;
    }
    return true;
  }

  onResizeEnd(event: ResizeEvent): void {
    this.style = {
      position: 'fixed',
      left: `${event.rectangle.left}px`,
      right: `${event.rectangle.right}px`,
      top: `${event.rectangle.top}px`,
      width: `${event.rectangle.width}px`,
      height: `${event.rectangle.height}px`,
    };

    this.bodyStyle = {
      height: `${event.rectangle.height - 95}px`,
    };
  }

  toggleTopologyVisibility(value: boolean) {
    this.isTopologyVisible = value;
    this.revertPosition();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onClick();
    }
  }

  onClick() {
    if (this.inputValue !== '') {
      this.messages.push({
        content: this.inputValue,
        class: 'chatBody__message_me',
      });
      this.inputValue = '';
    }
  }
}
