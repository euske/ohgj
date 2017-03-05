/// <reference path="utils.ts" />
/// <reference path="geom.ts" />
/// <reference path="entity.ts" />


//  Queue
//  A list of Tasks that runs sequentially.
//
class Queue extends Task {

    tasks: Task[];
    stopWhenEmpty: boolean = true;

    constructor(tasks: Task[]=null) {
	super();
	this.tasks = (tasks !== null)? tasks : [];
    }
  
    add(task: Task) {
	this.tasks.push(task);
	return this;
    }
  
    remove(task: Task) {
	removeElement(this.tasks, task);
	return this;
    }

    clear() {
	this.tasks = [];
	return this;
    }

    getCurrentTask() {
	return (0 < this.tasks.length)? this.tasks[0] : null;
    }

    tick() {
	let task:Task = null;
	while (true) {
	    task = this.getCurrentTask();
	    if (task === null) break;
	    if (task.layer === null) {
		task.layer = this.layer;
		task.init();
	    }
	    if (task.running) {
		task.tick();
		break;
	    }
	    this.remove(task);
	}
	if (this.stopWhenEmpty && task === null) {
	    this.stop();
	}
    }
}


//  Blinker
//
class Blinker extends Task {

    sprite: Sprite;
    interval: number = 1.0;
    
    constructor(sprite: Sprite) {
	super();
	this.sprite = sprite;
    }
    
    init() {
	super.init();
	if (this.sprite !== null) {
	    this.layer.addSprite(this.sprite);
	}
    }

    stop() {
	if (this.sprite !== null) {
	    this.layer.removeSprite(this.sprite);
	}
	super.stop();
    }
    
    update() {
	super.update();
	this.sprite.visible = (phase(this.getTime(), this.interval) == 0);
    }
}


//  Animator
//  Base class for all animator.
//
class Animator extends Task {
    
    entity: Entity;
    
    constructor(entity: Entity) {
	super();
	this.entity = entity;
    }    
}


//  Tweener
//
class Tweener extends Animator {

    srcpos: Vec2 = null;
    dstpos: Vec2 = null;
    
    init() {
	super.init();
	this.srcpos = this.entity.pos.copy();
    }
    
    update() {
	super.update();
	if (this.srcpos !== null && this.dstpos !== null) {
	    let t = this.getTime() / this.lifetime;
	    this.entity.pos = this.getPos(t);
	}
    }

    getPos(t: number) {
	return this.srcpos.interpolate(this.dstpos, t);
    }
}


//  PolyTweener
//
class PolyTweener extends Tweener {

    n: number;

    constructor(entity: Entity, n=2) {
	super(entity);
	this.n = n;
    }
}


//  PolyTweenerIn
//
class PolyTweenerIn extends PolyTweener {

    getPos(t: number) {
	t = Math.pow(t, this.n);
	return this.srcpos.interpolate(this.dstpos, t);
    }
}


//  PolyTweenerOut
//
class PolyTweenerOut extends PolyTweener {

    getPos(t: number) {
	t = 1.0 - Math.pow(1.0-t, this.n)
	return this.srcpos.interpolate(this.dstpos, t);
    }
}


//  PolyTweenerInOut
//
class PolyTweenerInOut extends PolyTweener {

    getPos(t: number) {
	if (t < 0.5) {
	    t = 0.5*Math.pow(2*t, this.n); // in
	} else {
	    t = 0.5*(2.0 - Math.pow(2.0-2*t, this.n)); // out
	}
	return this.srcpos.interpolate(this.dstpos, t);
    }
}