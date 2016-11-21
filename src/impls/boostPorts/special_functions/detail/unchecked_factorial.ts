"use strict";

/**
 * (C) Copyright John Maddock 2006.
 * (C) Copyright Zachary Martin 2016 (port to javascript).
 * Use, modification and distribution are subject to the
 * Boost Software License:
 *
 * Permission is hereby granted, free of charge, to any person or organization
 * obtaining a copy of the software and accompanying documentation covered by
 * this license (the "Software") to use, reproduce, display, distribute,
 * execute, and transmit the Software, and to prepare derivative works of the
 * Software, and to permit third-parties to whom the Software is furnished to
 * do so, all subject to the following:
 *
 * The copyright notices in the Software and this entire statement, including
 * the above license grant, this restriction and the following disclaimer,
 * must be included in all copies of the Software, in whole or in part, and
 * all derivative works of the Software, unless such copies or derivative
 * works are solely in the form of machine-executable object code generated by
 * a source language processor.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDERS OR ANYONE DISTRIBUTING THE SOFTWARE BE LIABLE
 * FOR ANY DAMAGES OR OTHER LIABILITY, WHETHER IN CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

export class UncheckedFactorial {

  public static unchecked_factorial(i: number): number {
    const factorials = [
      1,
      1,
      2,
      6,
      24,
      120,
      720,
      5040,
      40320,
      362880,
      3628800,
      39916800,
      479001600,
      6227020800,
      87178291200,
      1307674368000,
      20922789888000,
      355687428096000,
      6402373705728000,
      121645100408832000,
      2432902008176640000,
      51090942171709440000,
      1.1240007277776077e+21,
      2.585201673888498e+22,
      6.204484017332394e+23,
      1.5511210043330986e+25,
      4.0329146112660565e+26,
      1.0888869450418352e+28,
      3.0488834461171387e+29,
      8.841761993739702e+30,
      2.6525285981219107e+32,
      8.222838654177922e+33,
      2.631308369336935e+35,
      8.683317618811886e+36,
      2.9523279903960416e+38,
      1.0333147966386145e+40,
      3.7199332678990125e+41,
      1.3763753091226346e+43,
      5.230226174666011e+44,
      2.0397882081197444e+46,
      8.159152832478977e+47,
      3.345252661316381e+49,
      1.40500611775288e+51,
      6.041526306337383e+52,
      2.658271574788449e+54,
      1.1962222086548019e+56,
      5.502622159812089e+57,
      2.5862324151116818e+59,
      1.2413915592536073e+61,
      6.082818640342675e+62,
      3.0414093201713376e+64,
      1.5511187532873822e+66,
      8.065817517094388e+67,
      4.2748832840600255e+69,
      2.308436973392414e+71,
      1.2696403353658276e+73,
      7.109985878048635e+74,
      4.0526919504877214e+76,
      2.3505613312828785e+78,
      1.3868311854568984e+80,
      8.32098711274139e+81,
      5.075802138772248e+83,
      3.146997326038794e+85,
      1.98260831540444e+87,
      1.2688693218588417e+89,
      8.247650592082472e+90,
      5.443449390774431e+92,
      3.647111091818868e+94,
      2.4800355424368305e+96,
      1.711224524281413e+98,
      1.1978571669969892e+100,
      8.504785885678623e+101,
      6.1234458376886085e+103,
      4.4701154615126844e+105,
      3.307885441519386e+107,
      2.48091408113954e+109,
      1.8854947016660504e+111,
      1.4518309202828587e+113,
      1.1324281178206297e+115,
      8.946182130782976e+116,
      7.156945704626381e+118,
      5.797126020747368e+120,
      4.753643337012842e+122,
      3.945523969720659e+124,
      3.314240134565353e+126,
      2.81710411438055e+128,
      2.4227095383672734e+130,
      2.107757298379528e+132,
      1.8548264225739844e+134,
      1.650795516090846e+136,
      1.4857159644817615e+138,
      1.352001527678403e+140,
      1.2438414054641308e+142,
      1.1567725070816416e+144,
      1.087366156656743e+146,
      1.032997848823906e+148,
      9.916779348709496e+149,
      9.619275968248212e+151,
      9.426890448883248e+153,
      9.332621544394415e+155,
      9.332621544394415e+157,
      9.42594775983836e+159,
      9.614466715035127e+161,
      9.90290071648618e+163,
      1.0299016745145628e+166,
      1.081396758240291e+168,
      1.1462805637347084e+170,
      1.226520203196138e+172,
      1.324641819451829e+174,
      1.4438595832024937e+176,
      1.588245541522743e+178,
      1.7629525510902446e+180,
      1.974506857221074e+182,
      2.2311927486598138e+184,
      2.5435597334721877e+186,
      2.925093693493016e+188,
      3.393108684451898e+190,
      3.969937160808721e+192,
      4.684525849754291e+194,
      5.574585761207606e+196,
      6.689502913449127e+198,
      8.094298525273444e+200,
      9.875044200833601e+202,
      1.214630436702533e+205,
      1.506141741511141e+207,
      1.882677176888926e+209,
      2.372173242880047e+211,
      3.0126600184576594e+213,
      3.856204823625804e+215,
      4.974504222477287e+217,
      6.466855489220474e+219,
      8.47158069087882e+221,
      1.1182486511960043e+224,
      1.4872707060906857e+226,
      1.9929427461615188e+228,
      2.6904727073180504e+230,
      3.659042881952549e+232,
      5.012888748274992e+234,
      6.917786472619489e+236,
      9.615723196941089e+238,
      1.3462012475717526e+241,
      1.898143759076171e+243,
      2.695364137888163e+245,
      3.854370717180073e+247,
      5.5502938327393044e+249,
      8.047926057471992e+251,
      1.1749972043909107e+254,
      1.727245890454639e+256,
      2.5563239178728654e+258,
      3.80892263763057e+260,
      5.713383956445855e+262,
      8.62720977423324e+264,
      1.3113358856834524e+267,
      2.0063439050956823e+269,
      3.0897696138473508e+271,
      4.789142901463394e+273,
      7.471062926282894e+275,
      1.1729568794264145e+278,
      1.853271869493735e+280,
      2.9467022724950384e+282,
      4.7147236359920616e+284,
      7.590705053947219e+286,
      1.2296942187394494e+289,
      2.0044015765453026e+291,
      3.287218585534296e+293,
      5.423910666131589e+295,
      9.003691705778438e+297,
      1.503616514864999e+300,
      2.5260757449731984e+302,
      4.269068009004705e+304,
      7.257415615307999e+306,
    ];

    return factorials[i];
  }

  public static max_factorial(): number {return 170}

}

