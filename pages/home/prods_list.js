/* global zuix */
'use strict';
zuix.controller(function(cp) {
  const zx = zuix; // shorthand
  let prodsList;

  cp.create = function() {
    let url = cp.view().attr('data-o-rss');
    // Use a proxy to prevent CORS policy restrictions errors
    url = '//cors-anywhere.herokuapp.com/'+url;
    fetchList(url);
  };

  function refresh() {
    const list = cp.field('list');
    
    if (prodsList != null) {
      zx.$.each(prodsList, function(i, item) {
        const options = {
          lazyLoad: true,
          model: item
        };
        let el;
        if (i < 5) {
          // different layout for first 4 items (bigger)
          el = zx.createComponent('pages/home/prod_list/prod', options).container();
          // 2 columns layout
          if (i < 2) {
            el.setAttribute('self', 'size-1of2 lg-full md-full sm-full');
          } else {
            el.setAttribute('self', 'size-1of3 lg-half md-half sm-full');
          }
          el.setAttribute('class', 'card-wrapper'); // <-- will this work?
        } else {
          // "mini" layout for subsequent prods
          el = zx.createComponent('pages/home/prod_list/prod_mini', options).container();
          // 4 columns layout
          el.setAttribute('self', 'size-1of4 lg-half md-half sm-full');
          el.setAttribute('class', 'card-wrapper mini'); // <-- will this work?
        }
        // center the list on wide screens
        el.setAttribute('layout', 'column stretch-center');
        list.append(el);
      });
      zuix.componentize();
    }
  }

  // Download RSS feed
  function fetchList(rssUrl) {
    // CORS proxy https://cors-anywhere.herokuapp.com/
    zx.$.ajax({
      //url: "http://127.0.0.1:5500/dados2.json",
      url: rssUrl,
      success: function(res) {        
        prodsList = parseProd(res);
        refresh();        
      },
      error: function(err) {
        console.log("erro fetchList!");
        // TODO: handle error
      }
    });
  }

  // Parse RSS feed and create a JSON object out of it
  function parseProd(prodText) {
    const prods = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(prodText, "text/xml");
    let d = zx.$(doc);
    
    d.find('produtos > produto').each(function(i, el){
      const cod_pro = getText(this.find('cod_pro'));
      const descricao_pro = getText(this.find('descricao_pro'));
      const cod_barras_pro = getText(this.find('cod_barras_pro'));
      const descricao_pdv_pro = getText(this.find('descricao_pdv_pro'));
      
      const image = "/images/logo.png";
      if (descricao_pro !== '') {
        prods.push({
          cod_pro,
          descricao_pro,
          cod_barras_pro,
          descricao_pdv_pro,
          image
        });
      }
    });
    return prods;
  }

  function getText(node) {
    let text;
    // if node is ZxQuery, then get underlying HTMLElement
    if (node.length() > 0) node = node.get();
    if (node != null && node.firstChild != null) {
      // get rid of CDATA wrapper eventually
      text = node.firstChild.nodeValue;
    } else if (node != null) {
      // get value as is
      text = node.innerHTML;
    }
    return text;
  }
});
