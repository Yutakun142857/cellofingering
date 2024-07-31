let notes,
    divs,
    beam_width,
    kakutyo,
    high,
    open_cost,
    finger_distancde,
    move_distance,
    move_open,
    move_ealry,
    move_count,
    move_string,
    early;


function ables(noteid) {
    let results = [];
    let a = noteid%7, b = (noteid-a)/7;
    if (b>3) {b--;a+=7;}
    //人差し指(拡張なし)
    if (1<=a&&a<=8) for (let i = 0; i < 64; i++) { results.push(b<<14|i<<8|(a+1)<<3|b) }
    if (b>0&&a<=1) for (let i = 0; i < 64; i++) { results.push((b-1)<<14|i<<8|(a+8)<<3|(b-1)) }
    //人差し指(拡張あり)
    if (1<=a&&a<=7) for (let i = 0; i < 64; i++) { results.push(b<<14|i<<8|128|(a+2)<<3|b) }
    if (b>0&&a==0) for (let i = 0; i < 64; i++) { results.push((b-1)<<14|i<<8|128|(a+9)<<3|(b-1)) }
    //中指
    if (2<=a&&a<=9) for (let i = 0; i < 64; i++) { results.push((i&48)<<10|b<<12|(i&15)<<8|(a)<<3|b) }
    if (b>0&&a<=2) for (let i = 0; i < 64; i++) { results.push((i&48)<<10|(b-1)<<12|(i&15)<<8|(a+7)<<3|(b-1)) }
    // 薬指
    if (3<=a&&a<=10) for (let i = 0; i < 64; i++) { results.push((i&60)<<10|b<<10|(i&3)<<8|(a-1)<<3|b) }
    if (b>0&&a<=3) for (let i = 0; i < 64; i++) { results.push((i&60)<<10|(b-1)<<10|(i&3)<<8|(a+6)<<3|(b-1)) }
    // 小指
    if (4<=a&&a<=11) for (let i = 0; i < 64; i++) { results.push(i<<10|b<<8|(a-2)<<3|b) }
    if (b>0&&a<=4) for (let i = 0; i < 64; i++) { results.push(i<<10|(b-1)<<8|(a+5)<<3|(b-1)) }
    // 開放弦
    if (a==0) {
        for (let i = 0; i < 256; i++) {
            results.push(i<<8|20|b);
            for (let j = 3; j <= 9; j++) {
                results.push(i<<8|j<<3|4|b);
                results.push(i<<8|128|j<<3|4|b);
            }
        }
    }
    return results;
}

function diff(d1,d2) {
    let score = 0;
    score += Math.abs((d1&3)-(d2&3))*move_string;
    if ((d1>>3)!=(d2>>3)) {
        let movecost = (d2&4)?move_open:move_distance
        score += move_count + move_ealry * early;
        score += Math.sqrt(((d1>>14)-(d2>>14))**2+((d1>>3&15)-(d1>>7&1)-(d2>>3&15)+(d2>>7&1))**2)*movecost/4;
        score += Math.sqrt(((d1>>12&3)-(d2>>12&3))**2+((d1>>3&15)-(d1>>7&1)-(d2>>3&15)+(d2>>7&1))**2)*movecost/4;
        score += Math.sqrt(((d1>>10&3)-(d2>>10&3))**2+((d1>>3&15)-(d1>>7&1)-(d2>>3&15)+(d2>>7&1))**2)*movecost/4;
        score += Math.sqrt(((d1>>8&3)-(d2>>8&3))**2+((d1>>3&15)-(d1>>7&1)-(d2>>3&15)+(d2>>7&1))**2)*movecost/4;
    }
    return score;
}

function pos(d) {
    let score = 0;
    if (d&4) score += open_cost;
    if (d&128) score += kakutyo;
    score += ((d>>3&15)-2)*high;
    score += (Math.abs((d>>14)-(d>>12&3))+Math.abs((d>>12&3)-(d>>10&3))+Math.abs((d>>10&3)-(d>>8&3)))**2 * finger_distancde;
    return score;
}

function add(a,b) {
    if (a.length == 0) {
        a.push(b);
        return;
    }
    let p = 0,q = a.length-1,r = (p+q)>>1;
    while (q-p>1) {
        if (a[r][1]>b[1]) {
            q = r;
            r = (p+q)>>1;
        } else if (a[r][1]<b[1]) {
            p = r;
            r = (p+q)>>1;
        } else {
            a.splice(r,0,b);
            return;
        }
    }
    if (a[p][1]>b[1]) a.splice(p,0,b);
    else a.splice(p+1,0,b);
}

function search() {
    early = 0;
    let ds = ables(notes[0]).map(e=>[[e],pos(e)]);
    while (notes.length>1) {
        early++;
        let newds = [], m = ables(notes[1]);
        ds.forEach(e=>{
            m.forEach(f=>{
                add(newds,[[...e[0],f],e[1]+(diff(e[0].at(-1),f,notes[0],notes[1])+pos(f))/(divs.shift()??1)]);
                if (newds.length>beam_width) newds.pop();
            });
        });
        self.postMessage(notes.length);
        ds = newds;
        notes.shift();
    }
    return ds;
}

self.addEventListener("message", e => {
    let c = e.data;
    notes = c.notes;
    divs = c.divs;
    beam_width = c.beam_width;
    kakutyo = c.kakutyo;
    high = c.high;
    open_cost = c.open_cost;
    finger_distancde = c.finger_distancde;
    move_distance = c.move_distance;
    move_open = c.move_open;
    move_ealry = c.move_ealry;
    move_count = c.move_count;
    move_string = c.move_string;
    self.postMessage(search());
}, false);