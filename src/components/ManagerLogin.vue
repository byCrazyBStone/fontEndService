<template>
  <div id="container">
    <div class="login">
      <Form ref="formInline" :model="formInline" :rules="ruleInline">
          <FormItem prop="user">
              <Input type="text" v-model="formInline.user" placeholder="Username">
                  <Icon type="ios-person-outline" slot="prepend"></Icon>
              </Input>
          </FormItem>
          <FormItem prop="password" style="margin-top:25px;">
              <Input type="password" v-model="formInline.password" placeholder="Password">
                  <Icon type="ios-locked-outline" slot="prepend"></Icon>
              </Input>
          </FormItem>
          <FormItem>
              <Button type="success" @click="handleSubmit('formInline')" style="margin-top: 40px;" long>登入</Button>
              <Button type="primary" @click="handleReset('formInline')" style="margin-top: 8px;" long>重置</Button>
          </FormItem>
      </Form>
    </div>
    <svg id="demo" viewBox="0 0 1600 600" preserveAspectRatio="xMidYMid slice">
        <defs>
            <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="0" color-interpolation="sRGB">
                <stop id="stop1a" offset="0%" stop-color="#12a3b4"></stop>
                <stop id="stop1b" offset="100%" stop-color="#ff509e"></stop>
            </linearGradient>
            <linearGradient id="grad2" x1="0" y1="0" x2="1" y2="0" color-interpolation="sRGB">
                <stop id="stop2a" offset="0%" stop-color="#e3bc13"></stop>
                <stop id="stop2b" offset="100%" stop-color="#00a78f"></stop>
            </linearGradient>
        </defs>
        <rect id="rect1" x="0" y="0" width="1600" height="600" stroke="none" fill="url(#grad1)"></rect>
        <rect id="rect2" x="0" y="0" width="1600" height="600" stroke="none" fill="url(#grad2)"></rect>
    </svg>
  </div>
</template>

<script>
/* eslint-disable */
import { TweenMax, Power2, TimelineLite } from "gsap";
export default {
  name: "Welcome",
  data() {
    return {
      msg: "Welcome to Your Vue.js App",
      calcDelaunayTriangulation: {},
      tesselation: {},
      gradients: {},
      formInline: {
          user: '',
          password: ''
      },
      ruleInline: {
          user: [
              { required: true, message: 'Please fill in the user name', trigger: 'blur' }
          ],
          password: [
              { required: true, message: 'Please fill in the password.', trigger: 'blur' },
              { type: 'string', min: 6, message: 'The password length cannot be less than 6 bits', trigger: 'blur' }
          ]
      }
    };
  },
  mounted() {
    this.calcDelaunayTriangulation = (() => {
      var EPSILON = 1.0 / 1048576.0;
      function getSuperT(vertices) {
        var xMin = Number.POSITIVE_INFINITY,
          yMin = Number.POSITIVE_INFINITY,
          xMax = Number.NEGATIVE_INFINITY,
          yMax = Number.NEGATIVE_INFINITY,
          i,
          xDiff,
          yDiff,
          maxDiff,
          xCenter,
          yCenter;
        for (i = vertices.length; i--; ) {
          if (vertices[i][0] < xMin) xMin = vertices[i][0];
          if (vertices[i][0] > xMax) xMax = vertices[i][0];
          if (vertices[i][1] < yMin) yMin = vertices[i][1];
          if (vertices[i][1] > yMax) yMax = vertices[i][1];
        }
        xDiff = xMax - xMin;
        yDiff = yMax - yMin;
        maxDiff = Math.max(xDiff, yDiff);
        xCenter = xMin + xDiff * 0.5;
        yCenter = yMin + yDiff * 0.5;
        return [
          [xCenter - 20 * maxDiff, yCenter - maxDiff],
          [xCenter, yCenter + 20 * maxDiff],
          [xCenter + 20 * maxDiff, yCenter - maxDiff]
        ];
      }
      function circumcircle(vertices, i, j, k) {
        var xI = vertices[i][0],
          yI = vertices[i][1],
          xJ = vertices[j][0],
          yJ = vertices[j][1],
          xK = vertices[k][0],
          yK = vertices[k][1],
          yDiffIJ = Math.abs(yI - yJ),
          yDiffJK = Math.abs(yJ - yK),
          xCenter,
          yCenter,
          m1,
          m2,
          xMidIJ,
          xMidJK,
          yMidIJ,
          yMidJK,
          xDiff,
          yDiff;
        // bail condition
        if (yDiffIJ < EPSILON && yDiffJK < EPSILON)
          throw new Error(
            "Can't get circumcircle since all 3 points are y-aligned"
          );
        // calc circumcircle center x/y, radius
        m1 = -((xJ - xI) / (yJ - yI));
        m2 = -((xK - xJ) / (yK - yJ));
        xMidIJ = (xI + xJ) / 2.0;
        xMidJK = (xJ + xK) / 2.0;
        yMidIJ = (yI + yJ) / 2.0;
        yMidJK = (yJ + yK) / 2.0;
        xCenter =
          yDiffIJ < EPSILON
            ? xMidIJ
            : yDiffJK < EPSILON
              ? xMidJK
              : (m1 * xMidIJ - m2 * xMidJK + yMidJK - yMidIJ) / (m1 - m2);
        yCenter =
          yDiffIJ > yDiffJK
            ? m1 * (xCenter - xMidIJ) + yMidIJ
            : m2 * (xCenter - xMidJK) + yMidJK;
        xDiff = xJ - xCenter;
        yDiff = yJ - yCenter;
        // return
        return {
          i: i,
          j: j,
          k: k,
          x: xCenter,
          y: yCenter,
          r: xDiff * xDiff + yDiff * yDiff
        };
      }
      function dedupeEdges(edges) {
        var i, j, a, b, m, n;
        for (j = edges.length; j; ) {
          b = edges[--j];
          a = edges[--j];
          for (i = j; i; ) {
            n = edges[--i];
            m = edges[--i];
            if ((a === m && b === n) || (a === n && b === m)) {
              edges.splice(j, 2);
              edges.splice(i, 2);
              break;
            }
          }
        }
      }
      return function(vertices) {
        var n = vertices.length,
          i,
          j,
          indices,
          st,
          candidates,
          locked,
          edges,
          dx,
          dy,
          a,
          b,
          c;
        // bail if too few / too many verts
        if (n < 3 || n > 2000) return [];
        // copy verts and sort indices by x-position
        vertices = vertices.slice(0);
        indices = new Array(n);
        for (i = n; i--; ) indices[i] = i;
        indices.sort(function(i, j) {
          return vertices[j][0] - vertices[i][0];
        });
        // supertriangle
        st = getSuperT(vertices);
        vertices.push(st[0], st[1], st[2]);
        // init candidates/locked tris list
        candidates = [circumcircle(vertices, n + 0, n + 1, n + 2)];
        locked = [];
        edges = [];
        // scan left to right
        for (i = indices.length; i--; edges.length = 0) {
          c = indices[i];
          // check candidates tris against point
          for (j = candidates.length; j--; ) {
            // lock tri if point to right of circumcirc
            dx = vertices[c][0] - candidates[j].x;
            if (dx > 0.0 && dx * dx > candidates[j].r) {
              locked.push(candidates[j]);
              candidates.splice(j, 1);
              continue;
            }
            // point outside circumcirc = leave candidates
            dy = vertices[c][1] - candidates[j].y;
            if (dx * dx + dy * dy - candidates[j].r > EPSILON) continue;
            // point inside circumcirc = break apart, save edges
            edges.push(
              candidates[j].i,
              candidates[j].j,
              candidates[j].j,
              candidates[j].k,
              candidates[j].k,
              candidates[j].i
            );
            candidates.splice(j, 1);
          }
          // new candidates from broken edges
          dedupeEdges(edges);
          for (j = edges.length; j; ) {
            b = edges[--j];
            a = edges[--j];
            candidates.push(circumcircle(vertices, a, b, c));
          }
        }
        // close candidates tris, remove tris touching supertri verts
        for (i = candidates.length; i--; ) locked.push(candidates[i]);
        candidates.length = 0;
        for (i = locked.length; i--; )
          if (locked[i].i < n && locked[i].j < n && locked[i].k < n)
            candidates.push(locked[i].i, locked[i].j, locked[i].k);
        // done
        return candidates;
      };
    })();
    this.tesselation = (() => {
      var svg, svgW, svgH, prevGroup;
      var createRandomTesselation = () => {
        var wW = window.innerWidth;
        var wH = window.innerHeight;
        var gridSpacing = 250,
          scatterAmount = 0.75;
        var gridSize, i, x, y;
        if (wW / wH > svgW / svgH) {
          // window wider than svg = use width for gridSize
          gridSize = gridSpacing * svgW / wW;
        } else {
          // window taller than svg = use height for gridSize
          gridSize = gridSpacing * svgH / wH;
        }
        var vertices = [];
        var xOffset = (svgW % gridSize) / 2,
          yOffset = (svgH % gridSize) / 2;
        for (x = Math.floor(svgW / gridSize) + 1; x >= -1; x--) {
          for (y = Math.floor(svgH / gridSize) + 1; y >= -1; y--) {
            vertices.push([
              xOffset + gridSize * (x + scatterAmount * (Math.random() - 0.5)),
              yOffset + gridSize * (y + scatterAmount * (Math.random() - 0.5))
            ]);
          }
        }
        var triangles = this.calcDelaunayTriangulation(vertices);
        var group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        var polygon;
        for (i = triangles.length; i; ) {
          polygon = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polygon"
          );
          polygon.setAttribute(
            "points",
            vertices[triangles[--i]][0] +
              "," +
              vertices[triangles[i]][1] +
              " " +
              vertices[triangles[--i]][0] +
              "," +
              vertices[triangles[i]][1] +
              " " +
              vertices[triangles[--i]][0] +
              "," +
              vertices[triangles[i]][1]
          );
          group.appendChild(polygon);
        }
        return group;
      };
      return {
        setup: function(svgElement) {
          svg = svgElement;
          var vb = svg.getAttribute("viewBox").split(/\D/g);
          svgW = vb[2];
          svgH = vb[3];
        },
        next: function(t) {
          var toRemove, i, n;
          t /= 1000;
          if (prevGroup && prevGroup.children && prevGroup.children.length) {
            toRemove = prevGroup;
            n = toRemove.children.length;
            for (i = n; i--; ) {
              TweenMax.to(toRemove.children[i], t * 0.4, {
                opacity: 0,
                delay: t * (0.3 * i / n)
              });
            }
            TweenMax.delayedCall(
              t * (0.7 + 0.05),
              function(group) {
                svg.removeChild(group);
              },
              [toRemove],
              this
            );
          }
          var g = createRandomTesselation();
          n = g.children.length;
          for (i = n; i--; ) {
            TweenMax.fromTo(
              g.children[i],
              t * 0.4,
              {
                opacity: 0
              },
              {
                opacity: 0.3 + 0.25 * Math.random(),
                delay: t * (0.3 * i / n + 0.3),
                ease: Back.easeOut
              }
            );
          }
          svg.appendChild(g);
          prevGroup = g;
        }
      };
    })();
    this.gradients = (() => {
      var grad1, grad2, showingGrad1;
      // using colors from IBM Design Colors this time
      var colors = [
        // 14 colors - use 3-5 span
        "#3c6df0", // ultramarine50
        "#12a3b4", // aqua40
        "#00a78f", // teal40
        "#00aa5e", // green40
        "#81b532", // lime30
        "#e3bc13", // yellow20
        "#ffb000", // gold20
        "#fe8500", // orange30
        "#fe6100", // peach40
        "#e62325", // red50
        "#dc267f", // magenta50
        "#c22dd5", // purple50
        "#9753e1", // violet50
        "#5a3ec8" // indigo60
      ];
      function assignRandomColors(gradObj) {
        var rA = Math.floor(colors.length * Math.random());
        var rB = Math.floor(Math.random() * 3) + 3; // [3 - 5]
        rB =
          (rA + rB * (Math.random() < 0.5 ? -1 : 1) + colors.length) %
          colors.length;
        gradObj.stopA.setAttribute("stop-color", colors[rA]);
        gradObj.stopB.setAttribute("stop-color", colors[rB]);
      }
      return {
        setup: function() {
          showingGrad1 = false;
          grad1 = {
            stopA: document.getElementById("stop1a"),
            stopB: document.getElementById("stop1b"),
            rect: document.getElementById("rect1")
          };
          grad2 = {
            stopA: document.getElementById("stop2a"),
            stopB: document.getElementById("stop2b"),
            rect: document.getElementById("rect2")
          };
          grad1.rect.style.opacity = 0;
          grad2.rect.style.opacity = 0;
        },
        next: function(t) {
          t /= 1000;
          var show, hide;
          if (showingGrad1) {
            hide = grad1;
            show = grad2;
          } else {
            hide = grad2;
            show = grad1;
          }
          showingGrad1 = !showingGrad1;
          TweenMax.to(hide.rect, 0.55 * t, {
            opacity: 0,
            delay: 0.2 * t,
            ease: Sine.easeOut
          });
          assignRandomColors(show);
          TweenMax.to(show.rect, 0.65 * t, {
            opacity: 1,
            ease: Sine.easeIn
          });
        }
      };
    })();
    this.init();
  },
  methods: {
    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
          if (valid) {
              if (this.formInline.user === 'zhengziqiang' || this.formInline.password === localStorage.p){
                localStorage.flag = 1
                this.$router.push({path: '/managerindex'});
                this.$Message.success('Success!');
              } else {
                this.$Message.error('账户名或密码错误!');
              }
          } else {
              this.$Message.error('Fail!');
          }
      })
    },
    handleReset (name) {
        this.$refs[name].resetFields();
    },
    init: function(showStats) {
      // stats
      if (showStats) {
        var stats = new Stats();
        stats.domElement.style.position = "absolute";
        stats.domElement.style.left = "0";
        stats.domElement.style.top = "0";
        document.body.appendChild(stats.domElement);
        requestAnimationFrame(function updateStats() {
          stats.update();
          requestAnimationFrame(updateStats);
        });
      }
      // init
      var svg = document.getElementById("demo");
      this.tesselation.setup(svg);
      this.gradients.setup();
      var lastTransitionAt,
        transitionDelay = 5500,
        transitionDuration = 3000;
      var playNextTransition = () => {
        this.tesselation.next(transitionDuration);
        this.gradients.next(transitionDuration);
      };
      function tick(time) {
        window.requestAnimationFrame(tick);
      }
      svg.addEventListener(
        "click",
        function() {
          playNextTransition();
          window.requestAnimationFrame(tick);
        },
        false
      );
      playNextTransition();
      window.requestAnimationFrame(tick);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
* {
  margin: 0;
  padding: 0;
  list-style-type: none;
}
svg {
  width: 100%;
  height: 100%;
}
svg g {
  mix-blend-mode: lighten;
}
svg polygon {
  stroke: none;
  fill: white;
}
#container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  overflow: hidden;
}
#menu {
  position: absolute;
  left: 0;
  width: 320px;
  text-align: center;
  top: 50%;
  left: 50%;
  margin-left: -160px;
  margin-top: -160px;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}
h1,
h2 {
  position: relative;
}
h1 {
  font-family: "Montserrat", "Helvetica Neue", Arial, sans-serif;
  font-weight: 700;
  font-size: 30px;
  letter-spacing: 9px;
  text-transform: uppercase;
  margin: 12px 0;
  left: 4px;
  color: #555555;
}
h2 {
  color: #707070;
  font-weight: normal;
  font-size: 15px;
  letter-spacing: 0.12em;
  margin-bottom: 30px;
  left: 3px;
}
p {
  font-size: 14px;
  line-height: 2em;
  margin: 0;
  letter-spacing: 2px;
}
canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
a {
  color: #999;
  text-decoration: none;
  transition: color 0.2s ease;
}
a:hover {
  text-decoration: none;
  color: #f33;
}
.login {
  position: absolute;
  width: 360px;
  text-align: center;
  top: 50%;
  left: 50%;
  margin-left: -180px;
  margin-top: -160px;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}
</style>
