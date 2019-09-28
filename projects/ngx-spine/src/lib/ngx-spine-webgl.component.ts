import {
  Input,
  Output,
  EventEmitter,
  ViewChild,
  Component,
  OnInit,
  ElementRef,
  AfterViewInit
} from "@angular/core";

import {
  AssetManager,
  SceneRenderer,
  ManagedWebGLRenderingContext,
  ResizeMode
} from "./spine-ts/webgl";

import {
  TimeKeeper,
  Skeleton,
  AnimationState,
  SkeletonData,
  AtlasAttachmentLoader,
  SkeletonJson,
  SkeletonBinary,
  AnimationStateData,
  Vector2
} from "./spine-ts/core";

interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
  padLeft: string | number;
  padRight: string | number;
  padTop: string | number;
  padBottom: string | number;
}

@Component({
  selector: "ngx-spine-webgl",
  template: `
    <canvas class="ngx-spine-webgl" #canvas></canvas>
  `
})
export class NgxSpineWebglComponent implements OnInit, AfterViewInit {
  /* the URL of the skeleton .json file */
  @Input() jsonUrl: string;

  /* the URL of the skeleton .skel file */
  @Input() skelUrl: string;

  /* the URL of the skeleton .atlas file. Atlas page images are automatically resolved. */
  @Input() atlasUrl: string;

  /* Optional: the default mix time used to switch between two animations. */
  @Input() defaultMix = 0.25;

  /* Optional: whether the skeleton uses premultiplied alpha. Default: true. */
  @Input() premultipliedAlpha = true;

  @Input() transitionTime = 0.2;

  @ViewChild("canvas", { static: true, read: ElementRef })
  private canvas: ElementRef;

  // The name of the animation to be played. Default: first animation in the skeleton.
  private animationValue = null;

  @Output() animationChange = new EventEmitter();

  @Input()
  set animation(val: string) {
    this.animationValue = val;
    this.animationChange.emit(val);

    if (this.skeleton && this.animations.length > 0)  {
      this.playTime = 0;
      this.setAnimation(val);
    }
  }

  get animation(): string {
    return this.animationValue;
  }

  /* Optional: list of animation names from which the user can choose. */
  private animationsValue = [];

  @Output() animationsChange = new EventEmitter();

  @Input()
  set animations(val: string[]) {
    this.animationsValue = val;
    this.animationsChange.emit(val);
  }

  get animations(): string[] {
    return this.animationsValue;
  }

  /* Optional: the name of the skin to be set. Default: the default skin. */
  private skinValue = null;

  @Output() skinChange = new EventEmitter();

  @Input()
  set skin(val: string) {
    this.skinValue = val;
    this.skinChange.emit(this.skinValue);

    if (this.skeleton && this.animations.length > 0)  {
      this.skeleton.setSkinByName(val);
      this.skeleton.setSlotsToSetupPose();
    }
  }

  get skin(): string {
    return this.skinValue;
  }

  /* Optional: list of skin names from which the user can choose. */
  private skinsValue = [];

  @Output() skinsChange = new EventEmitter();

  @Input()
  set skins(val: string[]) {
    this.skinsValue = val;
    this.skinsChange.emit(val);
  }

  get skins(): string[] {
    return this.skinsValue;
  }

  @Output() loaded = new EventEmitter<boolean>();

  @Input() speed = 1;

  private sceneRenderer: SceneRenderer;
  private context: ManagedWebGLRenderingContext;
  private assetManager: AssetManager;
  private skeleton: Skeleton;
  private animationState: AnimationState;
  private time = new TimeKeeper();
  private paused = true;
  private playTime = 0;
  private currentViewport: Viewport = null;
  private previousViewport: Viewport = null;
  private viewportTransitionStart = 0;

  constructor() {}

  ngOnInit() {
    if (!this.jsonUrl && !this.skelUrl) {
      throw new Error(
        "Please specify the URL of the skeleton JSON or .skel file."
      );
    }
    if (!this.atlasUrl) {
      throw new Error("Please specify the URL of the atlas file.");
    }
  }

  ngAfterViewInit() {
    this.loaded.emit(false);
    // webgl setup
    try {
      this.context = new ManagedWebGLRenderingContext(
        this.canvas.nativeElement,
        { alpha: true }
      );
      this.sceneRenderer = new SceneRenderer(
        this.canvas.nativeElement,
        this.context,
        true
      );
    } catch (e) {
      throw new Error("");
    }

    console.log("webgl setup");

    // load the assets
    this.assetManager = new AssetManager(this.context);

    this.loadAsset().then(() => {
      console.log("load assets");
      this.loadSkeleton();
      this.loaded.emit(true);
      requestAnimationFrame(() => this.drawFrame());
    });
  }

  private loadAsset() {
    const promises = [];
    promises.push(
      new Promise((resolve, reject) => {
        this.assetManager.loadTextureAtlas(this.atlasUrl, resolve, reject);
      })
    );
    if (this.jsonUrl) {
      promises.push(
        new Promise((resolve, reject) => {
          this.assetManager.loadText(this.jsonUrl, resolve, reject);
        })
      );
    } else {
      promises.push(
        new Promise((resolve, reject) => {
          this.assetManager.loadBinary(this.skelUrl, resolve, reject);
        })
      );
    }
    return Promise.all(promises);
  }

  private loadSkeleton() {
    const atlas = this.assetManager.get(this.atlasUrl);
    let skeletonData: SkeletonData;

    try {
      if (this.jsonUrl) {
        const json = this.assetManager.get(this.jsonUrl);
        const skeletonJson = new SkeletonJson(new AtlasAttachmentLoader(atlas));
        skeletonData = skeletonJson.readSkeletonData(json);
      } else {
        const binary = this.assetManager.get(this.skelUrl);
        const skeletonBinary = new SkeletonBinary(
          new AtlasAttachmentLoader(atlas)
        );
        skeletonData = skeletonBinary.readSkeletonData(binary);
      }
    } catch (e) {
      throw new Error("");
    }

    this.skeleton = new Skeleton(skeletonData);
    const stateData = new AnimationStateData(skeletonData);
    stateData.defaultMix = this.defaultMix;
    this.animationState = new AnimationState(stateData);

    /// Setup skin
    if (skeletonData.skins.length > 0) {
      this.skins = skeletonData.skins.map(s => s.name);
    } else {
      throw new Error("");
    }

    if (this.skin) {
      if (!this.skins.includes(this.skin)) {
        throw new Error("");
      }
      this.skeleton.setSkinByName(this.skin);
      this.skeleton.setSlotsToSetupPose();
    } else {
      this.skin = this.skins[0];
    }

    /// Setup animations
    if (skeletonData.animations.length > 0) {
      this.animations = skeletonData.animations.map(a => a.name);
    }

    if (this.animation) {
      if (!this.animations.includes(this.animation)) {
        throw new Error("");
      }
    } else {
      this.animation = this.animations[0];
    }

    this.play();
  }

  drawFrame(requestNextFrame = true) {
    if (requestNextFrame) {
      requestAnimationFrame(() => this.drawFrame());
    }

    const gl = this.context.gl;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Resize the canvas
    this.sceneRenderer.resize(ResizeMode.Expand);

    // Update animation and skeleton
    if (!this.paused && this.animation) {
      this.time.update();
      const delta = this.time.delta * this.speed;

      const animationDuration = this.animationState.getCurrent(0).animation
        .duration;
      this.playTime += delta;
      while (this.playTime >= animationDuration && animationDuration !== 0) {
        this.playTime -= animationDuration;
      }
      this.playTime = Math.max(0, Math.min(this.playTime, animationDuration));
      // this.timelineSlider.setValue(this.playTime / animationDuration);

      this.animationState.update(delta);
      this.animationState.apply(this.skeleton);
    }

    this.skeleton.updateWorldTransform();

    let viewport = {
      x: this.currentViewport.x - (this.currentViewport.padLeft as number),
      y: this.currentViewport.y - (this.currentViewport.padBottom as number),
      width:
        this.currentViewport.width +
        (this.currentViewport.padLeft as number) +
        (this.currentViewport.padRight as number),
      height:
        this.currentViewport.height +
        (this.currentViewport.padBottom as number) +
        (this.currentViewport.padTop as number)
    };

    const transitionAlpha =
      (performance.now() - this.viewportTransitionStart) /
      1000 /
      this.transitionTime;
    if (this.previousViewport && transitionAlpha < 1) {
      const oldViewport = {
        x: this.previousViewport.x - (this.previousViewport.padLeft as number),
        y:
          this.previousViewport.y - (this.previousViewport.padBottom as number),
        width:
          this.previousViewport.width +
          (this.previousViewport.padLeft as number) +
          (this.previousViewport.padRight as number),
        height:
          this.previousViewport.height +
          (this.previousViewport.padBottom as number) +
          (this.previousViewport.padTop as number)
      };

      viewport = {
        x: oldViewport.x + (viewport.x - oldViewport.x) * transitionAlpha,
        y: oldViewport.y + (viewport.y - oldViewport.y) * transitionAlpha,
        width:
          oldViewport.width +
          (viewport.width - oldViewport.width) * transitionAlpha,
        height:
          oldViewport.height +
          (viewport.height - oldViewport.height) * transitionAlpha
      };
    }

    const viewportSize = this.scale(
      viewport.width,
      viewport.height,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );

    this.sceneRenderer.camera.zoom = viewport.width / viewportSize.x;
    this.sceneRenderer.camera.position.x = viewport.x + viewport.width / 2;
    this.sceneRenderer.camera.position.y = viewport.y + viewport.height / 2;

    this.sceneRenderer.begin();

    this.sceneRenderer.drawSkeleton(this.skeleton, this.premultipliedAlpha);

    this.sceneRenderer.end();

    this.sceneRenderer.camera.zoom = 0;
  }

  private play() {
    this.paused = false;

    this.setAnimation(this.animation);
  }

  private pause() {
    this.paused = true;
  }

  public setAnimation(animation: string) {
    // Determine viewport
    this.previousViewport = this.currentViewport;
    const animViewport = this.calculateAnimationViewport(animation);

    // The calculated animation viewport is the base
    const viewport: Viewport = {
      x: animViewport.x,
      y: animViewport.y,
      width: animViewport.width,
      height: animViewport.height,
      padLeft: "10%",
      padRight: "10%",
      padTop: "10%",
      padBottom: "10%"
    };

    // Translate percentage paddings to world units
    viewport.padLeft = this.percentageToWorldUnit(
      viewport.width,
      viewport.padLeft
    );
    viewport.padRight = this.percentageToWorldUnit(
      viewport.width,
      viewport.padRight
    );
    viewport.padBottom = this.percentageToWorldUnit(
      viewport.height,
      viewport.padBottom
    );
    viewport.padTop = this.percentageToWorldUnit(
      viewport.height,
      viewport.padTop
    );

    // Adjust x, y, width, and height by padding.
    this.currentViewport = viewport;
    this.viewportTransitionStart = performance.now();

    this.animationState.clearTracks();
    this.skeleton.setToSetupPose();
    this.animationState.setAnimation(0, animation, true);
  }

  private percentageToWorldUnit(
    size: number,
    percentageOrAbsolute: string | number
  ): number {
    if (typeof percentageOrAbsolute === "string") {
      return (
        (size *
          parseFloat(
            percentageOrAbsolute.substr(0, percentageOrAbsolute.length - 1)
          )) /
        100
      );
    } else {
      return percentageOrAbsolute;
    }
  }

  private calculateAnimationViewport(animationName: string) {
    const animation = this.skeleton.data.findAnimation(animationName);
    this.animationState.clearTracks();
    this.skeleton.setToSetupPose();
    this.animationState.setAnimationWith(0, animation, true);

    const steps = 100;
    const stepTime = animation.duration > 0 ? animation.duration / steps : 0;
    const offset = new Vector2();
    const size = new Vector2();

    let minX = 100000000;
    let maxX = -100000000;
    let minY = 100000000;
    let maxY = -100000000;

    for (let i = 0; i < steps; i++) {
      this.animationState.update(stepTime);
      this.animationState.apply(this.skeleton);
      this.skeleton.updateWorldTransform();
      this.skeleton.getBounds(offset, size);

      minX = Math.min(offset.x, minX);
      maxX = Math.max(offset.x + size.x, maxX);
      minY = Math.min(offset.y, minY);
      maxY = Math.max(offset.y + size.y, maxY);
    }

    offset.x = minX;
    offset.y = minY;
    size.x = maxX - minX;
    size.y = maxY - minY;

    return {
      x: offset.x,
      y: offset.y,
      width: size.x,
      height: size.y
    };
  }

  private scale(
    sourceWidth: number,
    sourceHeight: number,
    targetWidth: number,
    targetHeight: number
  ): Vector2 {
    const targetRatio = targetHeight / targetWidth;
    const sourceRatio = sourceHeight / sourceWidth;
    const scale =
      targetRatio > sourceRatio
        ? targetWidth / sourceWidth
        : targetHeight / sourceHeight;
    const temp = new Vector2();
    temp.x = sourceWidth * scale;
    temp.y = sourceHeight * scale;
    return temp;
  }
}
