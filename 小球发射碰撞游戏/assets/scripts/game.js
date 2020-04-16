cc.Class({
  extends: cc.Component,

  properties: {
    playerNode: cc.Node,
    boomNode: cc.Node,
    enemyNode: cc.Node,
    scoreLabel: cc.Label,
  },

  onLoad() {
    this.placePlayer();
    this.placeEnemy();
    this.node.on('touchstart', this.fire, this); // 绑定点击
  },

  onDestroy() {
    console.log('onDestroy');
    this.node.off('touchstart', this.fire, this); // 解除点击
  },
  update() {
    this.crash();
  },

  // 放置玩家节点
  placePlayer() {
    this.playerNode.active = true;
    this.isFire = false;
    this.playerNode.y = -cc.winSize.height / 4;
    this.fall();
  },

  // 放置敌人节点
  placeEnemy() {
    this.enemyNode.active = true;
    this.enemyNode.x = 0;
    this.enemyNode.y = cc.winSize.height / 2 - 80;

    let x = cc.winSize.width / 2 - this.enemyNode.width / 2;
    let y = (Math.random() * cc.winSize.height) / 4;

    let time = 1 + Math.random() * 0.5;

    let seq = cc.repeatForever(
      cc.sequence(cc.moveTo(time, -x, y), cc.moveTo(time, x, y))
    );
    this.enemyAction = this.enemyNode.runAction(seq);
  },

  // 玩家障碍物 碰撞
  crash() {
    let isCash =
      this.playerNode.position.sub(this.enemyNode.position).mag() <
      this.playerNode.width / 2 + this.enemyNode.width / 2;
    console.log(isCash);
    if (isCash) {
      this.enemyNode.active = false;
      this.boom(this.enemyNode.position, this.enemyNode.color);

      // 碰撞后更新得分 停止物体动画 重置物体继续比赛
      this.scoreLabel.string++;

      this.enemyNode.stopAction(this.enemyAction);
      this.playerNode.stopAction(this.playerAction);

      this.placePlayer();
      this.placeEnemy();
    }
  },

  // 发射
  fire() {
    if (this.isFire) return;
    this.isFire = true;

    // 向上移动
    let time = 0.8;
    let position = { x: 0, y: cc.winSize.height / 2 };
    this.move(time, position);
  },

  // 长时间不操作 小人将慢慢坠落
  fall() {
    let time = 8;
    let x = this.playerNode.x;
    let y = -(cc.winSize.height / 2 - this.playerNode.height);
    let position = { x, y };
    this.move(time, position);
  },

  // 道具上下移动动画
  move(time, position) {
    let seq = cc.sequence(
      cc.moveTo(time, cc.v2(position.x, position.y)),
      cc.callFunc(() => {
        this.die();
      })
    );
    this.playerAction = this.playerNode.runAction(seq);
  },

  // 爆炸 //爆炸位置 爆炸颜色
  boom(pos, color) {
    this.boomNode.setPosition(pos);
    let particle = this.boomNode.getComponent(cc.ParticleSystem);
    if (color !== undefined) {
      particle.startColor = particle.endColor = color;
    }
    particle.resetSystem();
  },

  // 游戏结束
  die() {
    console.log('over');
    this.playerNode.active = false;
    this.boom(this.playerNode.position, this.playerNode.color);

    setTimeout(() => {
      cc.director.loadScene('game');
    }, 1000);
  },

  // update (dt) {},
});
