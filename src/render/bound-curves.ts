import {ElementContainer} from '../dom/element-container';
import {getAbsoluteValue, getAbsoluteValueForTuple} from '../css/types/length-percentage';
import {Vector} from './vector';
import {BezierCurve} from './bezier-curve';
import {Path} from './path';


/**
 * 在图形学中，"BoundCurves"（边界曲线）通常用于描述或表示一个闭合图形的边界，例如二维图形或三维模型的边界。
 * 具体而言，BoundCurves 可能是由一系列有序的点、线段、曲线或其他几何元素组成的。这些元素按照特定的顺序连接起来，形成一个封闭的边界，
 * 该边界将定义图形或模型的形状。边界曲线可以用于表示简单的几何形状，如矩形、圆形或椭圆形，也可以用于表示更复杂的形状，如自由曲线或复杂的多边形。
 * 在计算机图形学中，BoundCurves 是一种常用的数据结构，用于表示图形或模型的几何形状。
 * 这些数据结构通常用于渲染图形、计算碰撞检测、计算物体之间的交互等各种图形学应用。
 * 在三维建模软件中，BoundCurves 可以用于表示三维模型的边界，使得用户可以对模型进行编辑和修改。
 * 总结而言，BoundCurves 在图形学中是用于表示闭合图形边界的数据结构或概念，它对于图形学算法和渲染技术具有重要意义。
 */

/**
 * 这个类名为 BoundCurves，根据代码可以看出它的作用是计算并存储一个元素的边界曲线。
 * 它针对一个 ElementContainer（元素容器）对象，通过读取该元素容器的样式和边界信息，
 * 计算并保存不同类型的边界曲线，包括外边框、内边框、描边、内边距和内容框等。
 * 具体来说，它的功能可以归纳为以下几点：
 * 根据元素容器的样式和边界信息，计算并保存边界曲线的不同部分，如四个角的外边框曲线、内边框曲线、描边曲线、边框曲线、内边距曲线以及内容框曲线。
 * 在计算曲线时，会考虑元素的边框圆角，边框宽度，内边距等信息，以确保边界曲线的正确性。
 * 为了实现不同类型的边框样式，比如圆角边框、双层边框等，该类会根据元素样式进行相应的处理和调整。
 * 通过计算得到的曲线点，最终构成不同类型的 Path 对象，并存储在类的对应属性中，供后续的图形渲染和处理使用。
 * 综合来看，BoundCurves 类的主要目的是提供一种方便的数据结构和方法，
 * 用于描述元素的边界曲线，特别是在处理带有复杂边框样式的元素时，能够更准确地计算和绘制边界曲线，以满足图形渲染和显示的需求。
 */
// BoundCurves类用于计算并存储元素的边界曲线。
export class BoundCurves {
    // 属性用于存储边界曲线的不同部分。
    // 外部双边框盒子曲线。
    readonly topLeftBorderDoubleOuterBox: Path;
    readonly topRightBorderDoubleOuterBox: Path;
    readonly bottomRightBorderDoubleOuterBox: Path;
    readonly bottomLeftBorderDoubleOuterBox: Path;
    // 内部双边框盒子曲线。
    readonly topLeftBorderDoubleInnerBox: Path;
    readonly topRightBorderDoubleInnerBox: Path;
    readonly bottomRightBorderDoubleInnerBox: Path;
    readonly bottomLeftBorderDoubleInnerBox: Path;
    // 描边曲线。
    readonly topLeftBorderStroke: Path;
    readonly topRightBorderStroke: Path;
    readonly bottomRightBorderStroke: Path;
    readonly bottomLeftBorderStroke: Path;
    // 单边框盒子曲线。
    readonly topLeftBorderBox: Path;
    readonly topRightBorderBox: Path;
    readonly bottomRightBorderBox: Path;
    readonly bottomLeftBorderBox: Path;
    // 内边距盒子曲线。
    readonly topLeftPaddingBox: Path;
    readonly topRightPaddingBox: Path;
    readonly bottomRightPaddingBox: Path;
    readonly bottomLeftPaddingBox: Path;
    // 内容盒子曲线。
    readonly topLeftContentBox: Path;
    readonly topRightContentBox: Path;
    readonly bottomRightContentBox: Path;
    readonly bottomLeftContentBox: Path;

    // 构造函数用于计算并存储边界曲线。
    constructor(element: ElementContainer) {
        const styles = element.styles;
        const bounds = element.bounds;

        // 根据元素样式计算边框半径的绝对值。
        let [tlh, tlv] = getAbsoluteValueForTuple(styles.borderTopLeftRadius, bounds.width, bounds.height);
        let [trh, trv] = getAbsoluteValueForTuple(styles.borderTopRightRadius, bounds.width, bounds.height);
        let [brh, brv] = getAbsoluteValueForTuple(styles.borderBottomRightRadius, bounds.width, bounds.height);
        let [blh, blv] = getAbsoluteValueForTuple(styles.borderBottomLeftRadius, bounds.width, bounds.height);

        // border-radius 如果非常大则会存在一个阈值
        const factors = [];
        factors.push((tlh + trh) / bounds.width);
        factors.push((blh + brh) / bounds.width);
        factors.push((tlv + blv) / bounds.height);
        factors.push((trv + brv) / bounds.height);
        const maxFactor = Math.max(...factors);

        // 如果任何角超出了元素的边界，则调整半径。算出其最大可以多大
        if (maxFactor > 1) {
            tlh /= maxFactor;
            tlv /= maxFactor;
            trh /= maxFactor;
            trv /= maxFactor;
            brh /= maxFactor;
            brv /= maxFactor;
            blh /= maxFactor;
            blv /= maxFactor;
        }

        // 计算元素边框、内边距和内容的各种尺寸。
        const topWidth = bounds.width - trh;
        const rightHeight = bounds.height - brv;
        const bottomWidth = bounds.width - brh;
        const leftHeight = bounds.height - blv;

        const borderTopWidth = styles.borderTopWidth;
        const borderRightWidth = styles.borderRightWidth;
        const borderBottomWidth = styles.borderBottomWidth;
        const borderLeftWidth = styles.borderLeftWidth;

        const paddingTop = getAbsoluteValue(styles.paddingTop, element.bounds.width);
        const paddingRight = getAbsoluteValue(styles.paddingRight, element.bounds.width);
        const paddingBottom = getAbsoluteValue(styles.paddingBottom, element.bounds.width);
        const paddingLeft = getAbsoluteValue(styles.paddingLeft, element.bounds.width);

        /**
         * 这段代码的意义是计算元素的左上角外部双边框盒子的曲线路径，并将结果存储在名为topLeftBorderDoubleOuterBox的属性中。
         * 代码逻辑如下：
         * 首先，检查tlh（左上角水平边框半径）和tlv（左上角垂直边框半径）是否大于零。
         * 如果至少一个半径大于零，表示左上角存在圆角，需要计算曲线路径。
         * 如果有圆角，则使用getCurvePoints函数计算曲线路径。
         * getCurvePoints函数接受五个参数：
         * 1. 起始点的水平坐标、
         * 2. 起始点的垂直坐标、
         * 3. 水平半径、
         * 4. 垂直半径和圆角的位置。
         * 在这里，圆角的位置是CORNER.TOP_LEFT，表示计算左上角的圆角曲线路径。
         * 
         * 曲线的起始点是bounds.left + borderLeftWidth / 3和bounds.top + borderTopWidth / 3，
         * 它们是元素左上角边框的起始点偏移了1/3边框宽度的位置。
         * 这个偏移可能是为了更好地适应边框的绘制样式。
         * 
         * 曲线的水平半径是tlh - borderLeftWidth / 3，垂直半径是tlv - borderTopWidth / 3。
         * 这些半径值分别减去了1/3边框宽度，也可能是为了更好地控制曲线的绘制。
         * 最后，如果元素的左上角没有圆角（即tlh和tlv都为零）
         * ，则使用一个新的Vector对象来存储一个点，
         * 该点的水平坐标是bounds.left + borderLeftWidth / 3，垂直坐标是bounds.top + borderTopWidth / 3。
         * 总结：这段代码的目的是根据元素样式中的左上角边框半径计算左上角外部双边框盒子的曲线路径，并将结果存储在topLeftBorderDoubleOuterBox属性中。
         */
        this.topLeftBorderDoubleOuterBox =
            tlh > 0 || tlv > 0
                ? getCurvePoints(
                      bounds.left + borderLeftWidth / 3,
                      bounds.top + borderTopWidth / 3,
                      tlh - borderLeftWidth / 3,
                      tlv - borderTopWidth / 3,
                      CORNER.TOP_LEFT
                  )
                : new Vector(bounds.left + borderLeftWidth / 3, bounds.top + borderTopWidth / 3);
        this.topRightBorderDoubleOuterBox =
            tlh > 0 || tlv > 0
                ? getCurvePoints(
                      bounds.left + topWidth,
                      bounds.top + borderTopWidth / 3,
                      trh - borderRightWidth / 3,
                      trv - borderTopWidth / 3,
                      CORNER.TOP_RIGHT
                  )
                : new Vector(bounds.left + bounds.width - borderRightWidth / 3, bounds.top + borderTopWidth / 3);
        this.bottomRightBorderDoubleOuterBox =
            brh > 0 || brv > 0
                ? getCurvePoints(
                      bounds.left + bottomWidth,
                      bounds.top + rightHeight,
                      brh - borderRightWidth / 3,
                      brv - borderBottomWidth / 3,
                      CORNER.BOTTOM_RIGHT
                  )
                : new Vector(
                      bounds.left + bounds.width - borderRightWidth / 3,
                      bounds.top + bounds.height - borderBottomWidth / 3
                  );
        this.bottomLeftBorderDoubleOuterBox =
            blh > 0 || blv > 0
                ? getCurvePoints(
                      bounds.left + borderLeftWidth / 3,
                      bounds.top + leftHeight,
                      blh - borderLeftWidth / 3,
                      blv - borderBottomWidth / 3,
                      CORNER.BOTTOM_LEFT
                  )
                : new Vector(bounds.left + borderLeftWidth / 3, bounds.top + bounds.height - borderBottomWidth / 3);
        this.topLeftBorderDoubleInnerBox =
            tlh > 0 || tlv > 0
                ? getCurvePoints(
                      bounds.left + (borderLeftWidth * 2) / 3,
                      bounds.top + (borderTopWidth * 2) / 3,
                      tlh - (borderLeftWidth * 2) / 3,
                      tlv - (borderTopWidth * 2) / 3,
                      CORNER.TOP_LEFT
                  )
                : new Vector(bounds.left + (borderLeftWidth * 2) / 3, bounds.top + (borderTopWidth * 2) / 3);
        this.topRightBorderDoubleInnerBox =
            tlh > 0 || tlv > 0
                ? getCurvePoints(
                      bounds.left + topWidth,
                      bounds.top + (borderTopWidth * 2) / 3,
                      trh - (borderRightWidth * 2) / 3,
                      trv - (borderTopWidth * 2) / 3,
                      CORNER.TOP_RIGHT
                  )
                : new Vector(
                      bounds.left + bounds.width - (borderRightWidth * 2) / 3,
                      bounds.top + (borderTopWidth * 2) / 3
                  );
        this.bottomRightBorderDoubleInnerBox =
            brh > 0 || brv > 0
                ? getCurvePoints(
                      bounds.left + bottomWidth,
                      bounds.top + rightHeight,
                      brh - (borderRightWidth * 2) / 3,
                      brv - (borderBottomWidth * 2) / 3,
                      CORNER.BOTTOM_RIGHT
                  )
                : new Vector(
                      bounds.left + bounds.width - (borderRightWidth * 2) / 3,
                      bounds.top + bounds.height - (borderBottomWidth * 2) / 3
                  );
        this.bottomLeftBorderDoubleInnerBox =
            blh > 0 || blv > 0
                ? getCurvePoints(
                      bounds.left + (borderLeftWidth * 2) / 3,
                      bounds.top + leftHeight,
                      blh - (borderLeftWidth * 2) / 3,
                      blv - (borderBottomWidth * 2) / 3,
                      CORNER.BOTTOM_LEFT
                  )
                : new Vector(
                      bounds.left + (borderLeftWidth * 2) / 3,
                      bounds.top + bounds.height - (borderBottomWidth * 2) / 3
                  );
        this.topLeftBorderStroke =
            tlh > 0 || tlv > 0
                ? getCurvePoints(
                      bounds.left + borderLeftWidth / 2,
                      bounds.top + borderTopWidth / 2,
                      tlh - borderLeftWidth / 2,
                      tlv - borderTopWidth / 2,
                      CORNER.TOP_LEFT
                  )
                : new Vector(bounds.left + borderLeftWidth / 2, bounds.top + borderTopWidth / 2);
        this.topRightBorderStroke =
            tlh > 0 || tlv > 0
                ? getCurvePoints(
                      bounds.left + topWidth,
                      bounds.top + borderTopWidth / 2,
                      trh - borderRightWidth / 2,
                      trv - borderTopWidth / 2,
                      CORNER.TOP_RIGHT
                  )
                : new Vector(bounds.left + bounds.width - borderRightWidth / 2, bounds.top + borderTopWidth / 2);
        this.bottomRightBorderStroke =
            brh > 0 || brv > 0
                ? getCurvePoints(
                      bounds.left + bottomWidth,
                      bounds.top + rightHeight,
                      brh - borderRightWidth / 2,
                      brv - borderBottomWidth / 2,
                      CORNER.BOTTOM_RIGHT
                  )
                : new Vector(
                      bounds.left + bounds.width - borderRightWidth / 2,
                      bounds.top + bounds.height - borderBottomWidth / 2
                  );
        this.bottomLeftBorderStroke =
            blh > 0 || blv > 0
                ? getCurvePoints(
                      bounds.left + borderLeftWidth / 2,
                      bounds.top + leftHeight,
                      blh - borderLeftWidth / 2,
                      blv - borderBottomWidth / 2,
                      CORNER.BOTTOM_LEFT
                  )
                : new Vector(bounds.left + borderLeftWidth / 2, bounds.top + bounds.height - borderBottomWidth / 2);
        this.topLeftBorderBox =
            tlh > 0 || tlv > 0
                ? getCurvePoints(bounds.left, bounds.top, tlh, tlv, CORNER.TOP_LEFT)
                : new Vector(bounds.left, bounds.top);
        this.topRightBorderBox =
            trh > 0 || trv > 0
                ? getCurvePoints(bounds.left + topWidth, bounds.top, trh, trv, CORNER.TOP_RIGHT)
                : new Vector(bounds.left + bounds.width, bounds.top);
        this.bottomRightBorderBox =
            brh > 0 || brv > 0
                ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh, brv, CORNER.BOTTOM_RIGHT)
                : new Vector(bounds.left + bounds.width, bounds.top + bounds.height);
        this.bottomLeftBorderBox =
            blh > 0 || blv > 0
                ? getCurvePoints(bounds.left, bounds.top + leftHeight, blh, blv, CORNER.BOTTOM_LEFT)
                : new Vector(bounds.left, bounds.top + bounds.height);
        this.topLeftPaddingBox =
            tlh > 0 || tlv > 0
                ? getCurvePoints(
                      bounds.left + borderLeftWidth,
                      bounds.top + borderTopWidth,
                      Math.max(0, tlh - borderLeftWidth),
                      Math.max(0, tlv - borderTopWidth),
                      CORNER.TOP_LEFT
                  )
                : new Vector(bounds.left + borderLeftWidth, bounds.top + borderTopWidth);
        this.topRightPaddingBox =
            trh > 0 || trv > 0
                ? getCurvePoints(
                      bounds.left + Math.min(topWidth, bounds.width - borderRightWidth),
                      bounds.top + borderTopWidth,
                      topWidth > bounds.width + borderRightWidth ? 0 : Math.max(0, trh - borderRightWidth),
                      Math.max(0, trv - borderTopWidth),
                      CORNER.TOP_RIGHT
                  )
                : new Vector(bounds.left + bounds.width - borderRightWidth, bounds.top + borderTopWidth);
        this.bottomRightPaddingBox =
            brh > 0 || brv > 0
                ? getCurvePoints(
                      bounds.left + Math.min(bottomWidth, bounds.width - borderLeftWidth),
                      bounds.top + Math.min(rightHeight, bounds.height - borderBottomWidth),
                      Math.max(0, brh - borderRightWidth),
                      Math.max(0, brv - borderBottomWidth),
                      CORNER.BOTTOM_RIGHT
                  )
                : new Vector(
                      bounds.left + bounds.width - borderRightWidth,
                      bounds.top + bounds.height - borderBottomWidth
                  );
        this.bottomLeftPaddingBox =
            blh > 0 || blv > 0
                ? getCurvePoints(
                      bounds.left + borderLeftWidth,
                      bounds.top + Math.min(leftHeight, bounds.height - borderBottomWidth),
                      Math.max(0, blh - borderLeftWidth),
                      Math.max(0, blv - borderBottomWidth),
                      CORNER.BOTTOM_LEFT
                  )
                : new Vector(bounds.left + borderLeftWidth, bounds.top + bounds.height - borderBottomWidth);
        this.topLeftContentBox =
            tlh > 0 || tlv > 0
                ? getCurvePoints(
                      bounds.left + borderLeftWidth + paddingLeft,
                      bounds.top + borderTopWidth + paddingTop,
                      Math.max(0, tlh - (borderLeftWidth + paddingLeft)),
                      Math.max(0, tlv - (borderTopWidth + paddingTop)),
                      CORNER.TOP_LEFT
                  )
                : new Vector(bounds.left + borderLeftWidth + paddingLeft, bounds.top + borderTopWidth + paddingTop);
        this.topRightContentBox =
            trh > 0 || trv > 0
                ? getCurvePoints(
                      bounds.left + Math.min(topWidth, bounds.width + borderLeftWidth + paddingLeft),
                      bounds.top + borderTopWidth + paddingTop,
                      topWidth > bounds.width + borderLeftWidth + paddingLeft ? 0 : trh - borderLeftWidth + paddingLeft,
                      trv - (borderTopWidth + paddingTop),
                      CORNER.TOP_RIGHT
                  )
                : new Vector(
                      bounds.left + bounds.width - (borderRightWidth + paddingRight),
                      bounds.top + borderTopWidth + paddingTop
                  );
        this.bottomRightContentBox =
            brh > 0 || brv > 0
                ? getCurvePoints(
                      bounds.left + Math.min(bottomWidth, bounds.width - (borderLeftWidth + paddingLeft)),
                      bounds.top + Math.min(rightHeight, bounds.height + borderTopWidth + paddingTop),
                      Math.max(0, brh - (borderRightWidth + paddingRight)),
                      brv - (borderBottomWidth + paddingBottom),
                      CORNER.BOTTOM_RIGHT
                  )
                : new Vector(
                      bounds.left + bounds.width - (borderRightWidth + paddingRight),
                      bounds.top + bounds.height - (borderBottomWidth + paddingBottom)
                  );
        this.bottomLeftContentBox =
            blh > 0 || blv > 0
                ? getCurvePoints(
                      bounds.left + borderLeftWidth + paddingLeft,
                      bounds.top + leftHeight,
                      Math.max(0, blh - (borderLeftWidth + paddingLeft)),
                      blv - (borderBottomWidth + paddingBottom),
                      CORNER.BOTTOM_LEFT
                  )
                : new Vector(
                      bounds.left + borderLeftWidth + paddingLeft,
                      bounds.top + bounds.height - (borderBottomWidth + paddingBottom)
                  );
        // 最后，将计算得到的曲线存储在对应的属性中。
    }
}

enum CORNER {
    TOP_LEFT = 0,
    TOP_RIGHT = 1,
    BOTTOM_RIGHT = 2,
    BOTTOM_LEFT = 3
}

const getCurvePoints = (x: number, y: number, r1: number, r2: number, position: CORNER): BezierCurve => {
    const kappa = 4 * ((Math.sqrt(2) - 1) / 3);
    const ox = r1 * kappa; // control point offset horizontal
    const oy = r2 * kappa; // control point offset vertical
    const xm = x + r1; // x-middle
    const ym = y + r2; // y-middle

    switch (position) {
        case CORNER.TOP_LEFT:
            return new BezierCurve(
                new Vector(x, ym),
                new Vector(x, ym - oy),
                new Vector(xm - ox, y),
                new Vector(xm, y)
            );
        case CORNER.TOP_RIGHT:
            return new BezierCurve(
                new Vector(x, y),
                new Vector(x + ox, y),
                new Vector(xm, ym - oy),
                new Vector(xm, ym)
            );
        case CORNER.BOTTOM_RIGHT:
            return new BezierCurve(
                new Vector(xm, y),
                new Vector(xm, y + oy),
                new Vector(x + ox, ym),
                new Vector(x, ym)
            );
        case CORNER.BOTTOM_LEFT:
        default:
            return new BezierCurve(
                new Vector(xm, ym),
                new Vector(xm - ox, ym),
                new Vector(x, y + oy),
                new Vector(x, y)
            );
    }
};

export const calculateBorderBoxPath = (curves: BoundCurves): Path[] => {
    return [curves.topLeftBorderBox, curves.topRightBorderBox, curves.bottomRightBorderBox, curves.bottomLeftBorderBox];
};

export const calculateContentBoxPath = (curves: BoundCurves): Path[] => {
    return [
        curves.topLeftContentBox,
        curves.topRightContentBox,
        curves.bottomRightContentBox,
        curves.bottomLeftContentBox
    ];
};

export const calculatePaddingBoxPath = (curves: BoundCurves): Path[] => {
    return [
        curves.topLeftPaddingBox,
        curves.topRightPaddingBox,
        curves.bottomRightPaddingBox,
        curves.bottomLeftPaddingBox
    ];
};
