import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

function Loading() {
  const pillControls = useAnimation();
  const brainControls = useAnimation();
  const plus1Controls = useAnimation();
  const plus2Controls = useAnimation();

  const startAnimation = async () => {
    while (true) {
      await pillControls.start({ opacity: 0 });
      await brainControls.start({ opacity: 0 });
      await plus1Controls.start({ opacity: 0 });
      await plus2Controls.start({ opacity: 0 });

      // pill
      await pillControls.start({ opacity: 1, scale: 0.5 });
      await pillControls.start({ rotate: 360, x: 30, y: -30, scale: 1 });
      await pillControls.start({ x: 0, y: 0 });

      // brain
      await brainControls.start({ opacity: 1, scale: 0.2 });
      await brainControls.start({ scale: 1 });

      // pill
      await pillControls.start({ x: -20, y: 20 });
      await pillControls.start({
        x: 0,
        y: 0,
        transition: { type: 'spring', stiffness: 100, damping: 10 },
      });

      // plus1, plus2
      await plus1Controls.start({ opacity: 1, rotate: 180 });
      await plus2Controls.start({ opacity: 1, rotate: 180 });
    }
  };

  useEffect(() => {
    startAnimation();
  }, []);

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 595 494"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <g id="logo-symbol">
        <motion.g id="plus1" initial={{ opacity: 0 }} animate={plus1Controls}>
          <g id="g310">
            <path
              id="path312"
              d="M553.193 50.1869C555.25 48.1522 555.25 44.8216 553.193 42.7856L537.591 27.3576L553.193 11.9282C555.25 9.89223 555.25 6.56156 553.193 4.52689C551.135 2.49223 547.767 2.49223 545.71 4.52689L530.109 19.9562L514.507 4.52689C512.449 2.49223 509.082 2.49223 507.023 4.52689C504.966 6.56156 504.966 9.89223 507.023 11.9282L522.625 27.3576L507.023 42.7856C504.966 44.8216 504.966 48.1522 507.023 50.1869C509.082 52.2216 512.449 52.2216 514.507 50.1869L530.109 34.7576L545.71 50.1869C547.767 52.2216 551.135 52.2216 553.193 50.1869Z"
              fill="#F29243"
            />
          </g>
          <g id="g111">
            <path
              id="path316"
              d="M553.193 50.1869C555.25 48.1522 555.25 44.8216 553.193 42.7856L537.591 27.3576L553.193 11.9282C555.25 9.89223 555.25 6.56156 553.193 4.52689C551.135 2.49223 547.767 2.49223 545.71 4.52689L530.109 19.9562L514.507 4.52689C512.449 2.49223 509.082 2.49223 507.023 4.52689C504.966 6.56156 504.966 9.89223 507.023 11.9282L522.625 27.3576L507.023 42.7856C504.966 44.8216 504.966 48.1522 507.023 50.1869C509.082 52.2216 512.449 52.2216 514.507 50.1869L530.109 34.7576L545.71 50.1869C547.767 52.2216 551.135 52.2216 553.193 50.1869Z"
              stroke="#F29243"
              strokeWidth="4.08"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </motion.g>
        <motion.g id="plus2" initial={{ opacity: 0 }} animate={plus2Controls}>
          <g id="g318">
            <path
              id="path320"
              d="M588.629 121.024H573.497V106.059C573.497 104.085 571.864 102.469 569.868 102.469C567.872 102.469 566.24 104.085 566.24 106.059V121.024H551.108C549.112 121.024 547.479 122.639 547.479 124.613C547.479 126.587 549.112 128.203 551.108 128.203H566.24V143.167C566.24 145.141 567.872 146.756 569.868 146.756C571.864 146.756 573.497 145.141 573.497 143.167V128.203H588.629C590.625 128.203 592.259 126.587 592.259 124.613C592.259 122.639 590.625 121.024 588.629 121.024Z"
              fill="#F29243"
            />
          </g>
          <g id="g222">
            <path
              id="path324"
              d="M588.629 121.024H573.497V106.059C573.497 104.085 571.864 102.469 569.868 102.469C567.872 102.469 566.24 104.085 566.24 106.059V121.024H551.108C549.112 121.024 547.479 122.639 547.479 124.613C547.479 126.587 549.112 128.203 551.108 128.203H566.24V143.167C566.24 145.141 567.872 146.756 569.868 146.756C571.864 146.756 573.497 145.141 573.497 143.167V128.203H588.629C590.625 128.203 592.259 126.587 592.259 124.613C592.259 122.639 590.625 121.024 588.629 121.024Z"
              stroke="#F29243"
              strokeWidth="4.08"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </motion.g>
        <motion.g id="brain" initial={{ opacity: 0 }} animate={brainControls}>
          <g id="g326">
            <path
              id="path328"
              d="M468.448 207.312C491.884 227.115 503.445 260.191 497.063 293.468C491.004 325.052 469.9 351.401 441.983 362.233L440.028 363.42L439.656 365.368C436.469 381.999 425.715 395.964 410.892 402.723L409.38 403.413L392.921 460.716C388.435 476.332 374.391 486.824 357.968 486.824C342.051 486.82 328.135 476.728 323.347 461.711L312.363 427.293L309.005 428.189C300.72 430.407 292.111 431.531 283.417 431.531C252.151 431.531 222.6 416.405 206.301 392.06L204.849 389.888L202.311 390.581C194.452 392.728 186.351 393.817 178.228 393.817C147.18 393.817 118.32 378.072 101.029 351.703L99.5733 350.067H97.6053C47.7827 350.067 7.25199 308.803 7.25199 258.08C7.25199 217.673 33.8947 181.424 72.0387 169.931L74.1493 169.293L74.5493 167.147C79.4506 140.821 103.399 121.715 131.489 121.715C135.557 121.715 139.616 122.121 143.551 122.92L145.901 123.396L147.265 121.441C161.592 100.907 185.551 88.6455 211.357 88.6455C225.745 88.6455 239.841 92.5081 252.119 99.8094L254.172 101.032L256.113 99.6454C269.923 89.7628 286.279 84.5375 303.407 84.5375C331.828 84.5375 357.556 98.7841 372.237 122.647L373.176 124.169L374.968 124.352C381.907 125.051 388.609 126.595 394.993 128.836L396.607 127.24L400.607 123.285C393.28 120.408 385.54 118.377 377.485 117.411C361.335 92.3015 333.775 77.3655 303.407 77.3655C285.539 77.3655 268.439 82.5841 253.804 92.4841C240.889 85.2734 226.269 81.4735 211.357 81.4735C183.975 81.4735 158.476 94.1375 142.668 115.464C138.993 114.851 135.243 114.543 131.489 114.543C100.657 114.543 74.252 135.096 67.8533 163.719C27.7893 176.795 0 215.281 0 258.08C0 312.095 42.7333 356.164 96.0253 357.219C114.768 384.664 145.352 400.989 178.228 400.989C186.139 400.989 194.031 400.033 201.725 398.147C219.619 423.228 250.663 438.703 283.417 438.703C291.576 438.703 299.668 437.781 307.521 435.957L316.428 463.868C322.175 481.887 338.867 493.992 357.968 493.996H357.971C377.667 493.996 394.519 481.409 399.897 462.677L415.453 408.512C431.048 400.821 442.449 386.099 446.465 368.172C475.771 356.031 497.803 328.103 504.188 294.805C511.019 259.188 498.664 223.725 473.581 202.235L473.009 202.801L468.448 207.312Z"
              fill="#F29243"
            />
          </g>
          <g id="g330">
            <path
              id="path332"
              d="M338.88 259.89C317.869 239.111 317.869 205.109 338.88 184.329L380.357 143.31C375.78 142.357 371.04 141.838 366.176 141.838C364.691 141.838 363.239 141.966 361.777 142.058C352.7 118.909 330.021 102.469 303.407 102.469C283.965 102.469 266.593 111.229 255.103 124.974C244.355 113.709 228.764 106.575 211.356 106.575C184.389 106.575 161.727 123.618 154.852 146.805C148.292 142.322 140.235 139.645 131.489 139.645C109.564 139.645 91.7908 156.278 91.7908 176.797C91.7908 179.359 92.0681 181.862 92.5961 184.278C55.0561 186.927 25.3828 218.91 25.3828 258.078C25.3828 298.979 57.7175 332.137 97.6055 332.137C101.925 332.137 106.132 331.677 110.243 330.933C122.001 357.43 147.984 375.887 178.227 375.887C191.172 375.887 203.345 372.506 213.961 366.566C222.295 393.655 250.192 413.599 283.417 413.599C298.277 413.599 312.081 409.609 323.553 402.782L340.633 456.315C346.067 473.341 370.549 472.99 375.481 455.817L394.735 388.786C407.608 387.478 419.005 376.835 421.845 362.026C422.699 357.574 422.689 353.187 421.96 349.062C449.329 345.115 473.169 321.837 479.251 290.127C484.628 262.093 474.624 235.213 455.643 219.974L415.283 259.89C394.272 280.669 359.891 280.669 338.88 259.89Z"
              fill="#FAD2B1"
            />
          </g>
        </motion.g>
        <motion.g id="pill" initial={{ opacity: 0 }} animate={pillControls}>
          <g id="g334">
            <path
              id="path336"
              d="M405.086 139.052L452.554 92.1041C459.975 84.7641 469.901 80.7228 480.499 80.7228C491.098 80.7228 501.023 84.7641 508.446 92.1041C523.853 107.345 523.853 132.143 508.446 147.383L460.974 194.328L405.086 139.052Z"
              fill="#FAD2B1"
            />
          </g>
          <g id="g338">
            <path
              id="path340"
              d="M377.081 261.043C366.483 261.043 356.557 257.002 349.136 249.662C333.728 234.42 333.728 209.623 349.136 194.382L396.607 147.438L452.495 202.714L405.027 249.662C397.605 256.998 387.68 261.043 377.081 261.043Z"
              fill="#F29243"
            />
          </g>
        </motion.g>
      </g>
    </svg>
  );
}

export default Loading;