/**
 * Copyright (C) 2015 DSIDEX, Inc.
 */

"use strict";

function IpfxInterpolator(points, lines) {

    this.calc = function(x){

        for(var i = 0; i < points.length - 1; i++){
            var p1 = points[i];
            var p2 = points[i + 1];

            if(x >= p1.x && x <= p2.x){

                var dx = p2.x - p1.x;
                if(dx > 0) {
                    var line = lines[i];
                    return line.calc((x - p1.x) / dx);
                }else{
                    return p1.y;
                }

            }

        }

        return 0;

    }

}

IpfxInterpolator.parseUrl = function(url){

    function Line(p1, p2, v1, v2, f) {

        var _this = this;
        var funcId;
        var func;

        this.getFunction = function () {
            return funcId;
        }

        this.getVectors = function () {
            return {v1: v1, v2: v2};
        }

        this.compile = function() {
            switch (funcId) {
                case IpfxInterpolator.Function.CURVE :
                    func.compile(p1, p2, v1, v2);
                    break;
                case IpfxInterpolator.Function.CURVE_LL :
                    func.compile(p1, p2, v1, v2);
                    break;
                case IpfxInterpolator.Function.CURVE_LR :
                    func.compile(p1, p2, v1, v2);
                    break;
                case IpfxInterpolator.Function.CURVE_T :
                    func.compile(p1, p2, v1, v2);
                    break;
                case IpfxInterpolator.Function.LINEAR :
                    func.compile(p1, p2);
                    break;
                case IpfxInterpolator.Function.HALF_SINE :
                    func.compile(p1, p2, v1);
                    break;
                case IpfxInterpolator.Function.CONSTANT :
                    func.compile(p1, p2);
                    break;
            }
        }

        function setFunction(f) {

            funcId = f;

            switch (funcId) {
                case IpfxInterpolator.Function.CURVE :
                    func = new IpfxInterpolator.Function.Curve(p1, p2, v1, v2);
                    break;
                case IpfxInterpolator.Function.CURVE_LL :
                    v1 = new IpfxInterpolator.Vector(0, 0);
                    func = new IpfxInterpolator.Function.Curve(p1, p2, v1, v2);
                    break;
                case IpfxInterpolator.Function.CURVE_LR :
                    v2 = new IpfxInterpolator.Vector(0, 0);
                    func = new IpfxInterpolator.Function.Curve(p1, p2, v1, v2);
                    break;
                case IpfxInterpolator.Function.CURVE_T :
                    v2 = IpfxInterpolator.Vector.sub(IpfxInterpolator.Vector.add(p1, v1), p2);
                    func = new IpfxInterpolator.Function.Curve(p1, p2, v1, v2);
                    break;
                case IpfxInterpolator.Function.LINEAR :
                    func = new IpfxInterpolator.Function.Linear(p1, p2);
                    break;
                case IpfxInterpolator.Function.HALF_SINE :
                    func = new IpfxInterpolator.Function.HalfSine(p1, p2, v1);
                    break;
                case IpfxInterpolator.Function.CONSTANT :
                    func = new IpfxInterpolator.Function.Constant(p1);
                    break;
            }
            _this.compile();

        }

        this.calc = function (x) {
            return func.calc(x);
        }

        setFunction(f);

    }

    var data = IpfxInterpolator.Data.parseUrl(url);

    var points = [];
    var lines = [];

    for(var i = 0; i < data.points.length; i++){
        var p = data.points[i];
        points.push(new IpfxInterpolator.Vector(p.x, p.y));
    }

    for(var i = 0; i < points.length - 1; i++){
        var p1 = points[i];
        var p2 = points[i + 1];
        var l = data.lines[i];
        var line = new Line(p1, p2, l.v1, l.v2, l.f);
        line.compile();
        lines.push(line);
    }

    return new IpfxInterpolator(points, lines);

}

IpfxInterpolator.Data = function(points, lines){
    this.points = points;
    this.lines = lines;
}

IpfxInterpolator.Data.parseUrl = function(url){

    var GRID_X = 65535.0;
    var GRID_Y = 32767.0;
    var GRID_Y0 = 32767.0;
    var GRID_VX = 21844.0;
    var GRID_VY = 10922.0;

    function fromGridX(x){
        return x / GRID_X;
    }

    function fromGridY(y){
        return (y - GRID_Y0) / GRID_Y;
    }

    function fromGridVX(vx){
        return (vx - GRID_Y0) / GRID_VX;
    }

    function fromGridVY(vy){
        return (vy - GRID_Y0) / GRID_VY;
    }

    function inAlphabet(c){
        return (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f');
    }

    function createBase(){
        var points = [new IpfxInterpolator.Vector(0.0, 0.0), new IpfxInterpolator.Vector(1.0, 0.0)];
        var lines = [{v1 : new IpfxInterpolator.Vector(0.33, 0), v2 : new IpfxInterpolator.Vector(-0.33, 0), f : 0}];
        return new IpfxInterpolator.Data(points, lines);
    }

    function checkData(pdata, ldata){

        if(checkDataAlphabet(pdata) && checkDataAlphabet(ldata)){

            if(pdata.length % 8 != 0){
                return false;
            }

            var pc = Math.floor(pdata.length / 8) + 1;

            var caret = {data : ldata, pos : 0};

            var i = 0;
            while (i < pc - 1) {

                var f = readHexValue(caret, 1);

                switch (f) {
                    case IpfxInterpolator.Function.CURVE :
                        caret.pos = caret.pos + 16;
                        break;
                    case IpfxInterpolator.Function.CURVE_LL :
                        caret.pos = caret.pos + 8;
                        break;
                    case IpfxInterpolator.Function.CURVE_LR :
                        caret.pos = caret.pos + 8;
                        break;
                    case IpfxInterpolator.Function.CURVE_T :
                        caret.pos = caret.pos + 8;
                        break;
                    case IpfxInterpolator.Function.LINEAR :
                        caret.pos = caret.pos + 0;
                        break;
                    case IpfxInterpolator.Function.HALF_SINE :
                        caret.pos = caret.pos + 8;
                        break;
                    case IpfxInterpolator.Function.CONSTANT :
                        caret.pos = caret.pos + 0;
                        break;

                    default :
                        return false;

                }

                if(caret.pos > ldata.length){
                    return false;
                }

                i++;

            }

            return caret.pos == ldata.length;


        }

        return false;

    }

    function checkDataAlphabet(data){
        for(var i = 0; i < data.length; i++){
            if(!inAlphabet(data[i])){
                return false;
            }
        }
        return true;
    }

    function getPointsData(data){

        var points = [];
        var caret = {data : data, pos : 0};

        var p0 = new IpfxInterpolator.Vector(0.0, fromGridY(readHexValue(caret, 4)));
        var p2 = new IpfxInterpolator.Vector(1.0, fromGridY(readHexValue(caret, 4)));

        points.push(p0);

        while(caret.pos < data.length){
            points.push(new IpfxInterpolator.Vector(fromGridX(readHexValue(caret, 4)), fromGridY(readHexValue(caret, 4))));
        }

        points.push(p2);

        return points;

    }

    function getLinesData(data, points){

        var lines = [];
        var caret = {data : data, pos : 0};

        var i = 0;

        while (caret.pos < data.length) {

            var f = readHexValue(caret, 1);
            var v1 = null;
            var v2 = null;

            switch (f) {
                case IpfxInterpolator.Function.CURVE :
                    v1 = new IpfxInterpolator.Vector(fromGridVX(readHexValue(caret, 4)), fromGridVY(readHexValue(caret, 4)));
                    v2 = new IpfxInterpolator.Vector(fromGridVX(readHexValue(caret, 4)), fromGridVY(readHexValue(caret, 4)));
                    break;
                case IpfxInterpolator.Function.CURVE_LL :
                    v1 = new IpfxInterpolator.Vector(0, 0);
                    v2 = new IpfxInterpolator.Vector(fromGridVX(readHexValue(caret, 4)), fromGridVY(readHexValue(caret, 4)));
                    break;
                case IpfxInterpolator.Function.CURVE_LR :
                    v1 = new IpfxInterpolator.Vector(fromGridVX(readHexValue(caret, 4)), fromGridVY(readHexValue(caret, 4)));
                    v2 = new IpfxInterpolator.Vector(0, 0);
                    break;
                case IpfxInterpolator.Function.CURVE_T :
                    var p1 = points[i];
                    var p2 = points[i + 1];
                    v1 = new IpfxInterpolator.Vector(fromGridVX(readHexValue(caret, 4)), fromGridVY(readHexValue(caret, 4)));
                    v2 = IpfxInterpolator.Vector.sub(IpfxInterpolator.Vector.add(p1, v1), p2);
                    break;
                case IpfxInterpolator.Function.LINEAR :
                    break;
                case IpfxInterpolator.Function.HALF_SINE :
                    v1 = new IpfxInterpolator.Vector(fromGridVX(readHexValue(caret, 4)), fromGridVY(readHexValue(caret, 4)));
                    break;
                case IpfxInterpolator.Function.CONSTANT :
                    break;
            }

            lines.push({v1 : v1, v2 : v2, f : f});

            i++;

        }

        return lines;

    }

    function readHexValue(caret, size){
        var vs = caret.data.substring(caret.pos, caret.pos + size);
        caret.pos = caret.pos + size;
        if(vs != ""){
            return parseInt(vs, 16);
        }else{
            return 0;
        }
    }

    var pdi = url.indexOf("?p=");
    var ldi = url.indexOf("&l=");

    if (ldi < pdi) {
        return null;
    }

    if(pdi === -1 && ldi === -1){
        return createBase();
    }

    var pdata = url.substring(pdi + 3, ldi);
    var ldata = url.substring(ldi + 3);

    if (checkData(pdata, ldata)) {
        var points = getPointsData(pdata);
        var lines = getLinesData(ldata, points);
        return new IpfxInterpolator.Data(points, lines);
    }

    return null;

}

IpfxInterpolator.Vector = function(vx, vy) {
    this.x = vx;
    this.y = vy;
}

IpfxInterpolator.Vector.add = function (v1, v2) {
    return new IpfxInterpolator.Vector(v1.x + v2.x, v1.y + v2.y);
}

IpfxInterpolator.Vector.sub = function (v1, v2) {
    return new IpfxInterpolator.Vector(v1.x - v2.x, v1.y - v2.y);
}

IpfxInterpolator.Vector.mul = function (v1, v2) {
    return new IpfxInterpolator.Vector(v1.x * v2.x, v1.y * v2.y);
}

IpfxInterpolator.Vector.addC = function (v1, C) {
    return new IpfxInterpolator.Vector(v1.x + C, v1.y + C);
}

IpfxInterpolator.Vector.mulC = function (v1, C) {
    return new IpfxInterpolator.Vector(v1.x * C, v1.y * C);
}

IpfxInterpolator.Vector.center = function (v1, v2) {
    return new IpfxInterpolator.Vector(0.5 * (v1.x + v2.x), 0.5 * (v1.y + v2.y));
}

IpfxInterpolator.Vector.slide = function (v1, v2, i) {
    var o = 1 - i;
    return new IpfxInterpolator.Vector(v1.x * o + v2.x * i, v1.y * o + v2.y * i);
}

IpfxInterpolator.Vector.mod = function (v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

IpfxInterpolator.Vector.k = function (v) {
    if (v.x != 0) {
        return v.y / v.x;
    } else {
        return 0;
    }
}

IpfxInterpolator.Vector.kd = function (v) {

    if (v.x != 0) {
        var vk = v.y / v.x;
        return Math.sqrt(1 + vk * vk);
    } else {
        return 0;
    }

}

IpfxInterpolator.Function = function() {
}

IpfxInterpolator.Function.Curve = function (point1, point2, v1, v2) {

    var p1;
    var p2;
    var dx;
    var m1;
    var m2;
    var k1;
    var k2;
    var d1;
    var d2;

    this.compile = function (point1, point2, v1, v2) {
        p1 = point1;
        p2 = point2;
        dx = p2.x - p1.x;
        m1 = IpfxInterpolator.Vector.mod(v1);
        m2 = IpfxInterpolator.Vector.mod(v2);
        k1 = IpfxInterpolator.Vector.k(v1);
        k2 = IpfxInterpolator.Vector.k(v2);
        d1 = IpfxInterpolator.Vector.kd(v1);
        d2 = IpfxInterpolator.Vector.kd(v2);
    }

    this.calc = function (x) {

        if (dx === 0) {
            return p1.y;
        }

        var i = x;
        var o = 1 - i;

        var yv1 = k1 * i;
        var yv2 = -k2 * o;

        var f1 = m1 * o / (1 + d1 * i);
        var f2 = m2 * i / (1 + d2 * o);

        var F = f1 + f2 + 1;
        var pc1 = f1 / F;
        var pc2 = f2 / F;

        var y1 = p1.y + yv1;
        var y2 = p2.y + yv2;
        var y3 = p1.y * o + p2.y * i;

        return y1 * pc1 + y2 * pc2 + y3 / F;

    }

    this.compile(point1, point2, v1, v2);

}

IpfxInterpolator.Function.Linear = function (point1, point2) {

    var k;
    var p1;
    var p2;

    this.compile = function (point1, point2) {
        p1 = point1;
        p2 = point2;
        var dx = p2.x - p1.x;
        if (dx > 0) {
            k = IpfxInterpolator.Vector.k(IpfxInterpolator.Vector.sub(p2, p1)) * dx;
        }

    }

    this.calc = function (x) {
        return p1.y + k * x;
    }

    this.compile(point1, point2);

}

IpfxInterpolator.Function.HalfSine = function (point1, point2, v1) {

    var p1;
    var p2;
    var dx;
    var dx1;
    var k1;
    var k2;
    var step1;
    var step2;

    this.compile = function (point1, point2, v1) {
        p1 = point1;
        p2 = point2;
        dx = p2.x - p1.x;

        if (dx > 0) {

            dx1 = v1.x / dx;
            var dx2 = 1 - dx1;

            step1 = 0.5 * Math.PI / dx1;
            step2 = 0.5 * Math.PI / dx2;

            k1 = v1.y;
            k2 = p1.y + v1.y - p2.y;

        }

    }

    this.calc = function (x) {

        if (dx === 0) {
            return p1.y;
        }

        if (x < dx1) {
            return p1.y + k1 * Math.sin(x * step1);
        } else {
            return p2.y + k2 * Math.sin((x - dx1) * step2 + 0.5 * Math.PI);
        }

    }

    this.compile(point1, point2, v1);

}

IpfxInterpolator.Function.Constant = function (point1) {

    var v;

    this.compile = function (point1) {
        v = point1.y;
    }

    this.calc = function (x) {
        return v;
    }

    this.compile(point1);

}

IpfxInterpolator.Function.CURVE = 0;
IpfxInterpolator.Function.CURVE_LL = 1;
IpfxInterpolator.Function.CURVE_LR = 2;
IpfxInterpolator.Function.CURVE_T = 3;
IpfxInterpolator.Function.LINEAR = 4;
IpfxInterpolator.Function.HALF_SINE = 5;
IpfxInterpolator.Function.CONSTANT = 6;
