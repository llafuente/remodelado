/**
 * This file uses the Page Object pattern to define the main page for tests
 * https://docs.google.com/presentation/d/1B6manhG0zEXkC-H-tPo2vwU06JhL8w9-XCF9oehXzAQ
 */

'use strict';

browser.driver.manage().window().setSize(1024, 768);
//browser.driver.manage().window().maximize();
browser.driver.manage().window().setPosition(50, 50);

var backspace50 = '';
for (var i = 0; i < 50; ++i) {
  backspace50 += protractor.Key.BACK_SPACE;
}

function random_number(n) {
  var text = '';
  var possible = '0123456789';
  var i;

  for (i = 0; i < (n || 10); i++) {
    if (n % 11 === 0) {
      text += ' ';
    } else {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
  }

  return text;
}

function random_str(n) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var i;

  for (i = 0; i < (n || 10); i++) {
    if (n % 11 === 0) {
      text += ' ';
    } else {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
  }

  return text;
}

function random_email() {
  return random_str(5) + '@' + random_str(5) + '.com';
}

function random_date(year) {
  // 2014-07-10
  var m = Math.floor(Math.random() * 11) + 1;
  var d = Math.floor(Math.random() * 25) + 1;

  return year + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d);
}

var Config = function() {
  return {
    go: function(url) {
      console.log('# goto', url);

      browser.ignoreSynchronization = true;

      browser.get(url);
      browser.waitForAngular();

      // wait a bit more, allow alert to appear
      browser.sleep(500);
      browser.switchTo().alert().accept()
      .then(function() {
        // this will reaload, wait more
        browser.sleep(2500);
        browser.waitForAngular();
        browser.sleep(500);
      }, function(e) {
        console.log('# alert', e.name);
      }).then(function() {
        console.log('# goto ', url, ' done');
        browser.ignoreSynchronization = false;
      });
    },
    login: function(user, pwd) {
      // logout if necessary

      browser.get(this.base_url + '/login');
      browser.waitForAngular();

      element(by.model('user.email')).sendKeys(user);
      element(by.model('user.password')).sendKeys(pwd);

      $('#login-submit').click();
      browser.waitForAngular();
      browser.sleep(250);
      browser.waitForAngular();
    },
    logout: function() {
      this.click('Logout');
      browser.sleep(500);
      this.click('Sí');
    },
    //
    // selectors
    //
    $p: function(selector) {
      return $('[protractor=\'' + selector + '\']');
    },
    $m: function(selector) {
      return element(by.model(selector));
    },
    ui_link: function(ui_sref) {
      return $('a[ui-sref=\'' + ui_sref + '\']');
    },
    by_text: function(text) {
      return element(by.xpath('//*[contains(text(),\'' + text + '\')]'));
    },
    parent: function(selector) {
      if ('string' === typeof selector) {
        selector = $(selector);
      }

      return selector.$(by.xpath('..'));
    },
    //
    // click
    //
    sref_click: function(ui_sref) {
      this.ui_link(ui_sref).click();
      browser.waitForAngular();
    },
    xpath_click: function(xpath) {
      var script = 'document.evaluate(' +
        JSON.stringify(xpath) +
        ', document, null, 9, null).singleNodeValue.click()';

      browser.executeScript(script);
      browser.waitForAngular();
    },
    click: function(css) {
      $(css).click();
      browser.sleep(125);
      return browser.waitForAngular();
    },
    click_text: function(text) {
      this.xpath_click(
        '//*[contains(text(),\'' + text + '\')]'
      );
      browser.sleep(125);
      return browser.waitForAngular();
    },
    click_inside: function(selector, text) {
      this.xpath_click(
        '//' + selector + '//*[contains(text(),\'' + text + '\')]'
      );
    },
    click_menu_tree: function(text) {
      this.xpath_click(
        '//div[@id=\'menu-tree\']//*[contains(text(),\'' + text + '\')]'
      );
    },
    save_entity: function() {
      return $('.save-button-container button').click();
    },
    //
    // forms
    //
    fill: function(path, data, fields) {
      var self = this;
      Object.keys(data).forEach(function(k) {
        self.fill_control(k, data[k], true);
      });

      browser.waitForAngular();

      // TODO check number of fields
      // $(path).all(by.tagName('input, select, textarea'))
    },
    // select: match value or text -> click
    // text: fill input
    fill_control: function(model, value, clear) {
      var el = 'string' === typeof model ? element(by.model(model)) : model;

      el.getAttribute('type')
      .then(function(type) {
        switch (type) {
        case 'datepicker':
          if (clear) {
            el.clear();
          }

          el.click();
          browser.sleep(125);

          el.sendKeys(value);
          browser.sleep(250); // wait a bit before click on body
          $('body').click();
          break;
        case 'date':
        /*
          throw new Error('date is not supported');

          // try to fix chrome date helper!
          return browser.executeAsyncScript(function() {
            var el = jQuery(arguments[0]);
            el.attr('type', 'text');
            el.val(value);
            el.attr('type', 'date');
            var callback = arguments[arguments.length - 1];
            callback();
          }, model, value);
        break;
        */
        case 'number':
        case 'text':
        case 'email':
          if (clear) {
            el.clear();
          }
          if ('number' === type) {
            // backspace keys
            el.sendKeys(backspace50);
          }

          el.sendKeys(value);
          break;
        case 'checkbox':
          //console.log('checkbox!!!');
          el
          .getAttribute('checked')
          .then(function(checked) {
            //console.log('checkbox', checked, value);
            if (checked != value) {
              el.click();
            }
          });
          break;
        case 'select-one':
        case 'select':
          var text = value;

          el
          .all(by.tagName('option'))
          .then(function(options) {
            //console.log('options.length', options.length);
            options.forEach(function(o) {
              o.getAttribute('value')
              .then(function(val) {
                ['string:', 'number:'].forEach(function(c) {
                  var svalue =  c + value;
                  //console.log('check value', svalue == val, svalue, val);

                  if (svalue == val) {
                    o.click();
                  }
                });
              });

              o.getAttribute('label')
              .then(function(val) {
                //console.log('check value', svalue == val, svalue, val);
                if (value == val) {
                  o.click();
                }
              });

              o.getText()
              .then(function(t) {
                //console.log('text', t, text);
                if (t == text) {
                  o.click();
                }
              });
            });
          });
          break;
        default:
          console.log('TODO! handle this type!!!', type);
        }
      });
    },
    //
    // assert
    //
    has_class: function(selector, cls) {
      if ('string' === typeof selector) {
        selector = $(selector);
      }

      expect(
        selector.getAttribute('class')
        .then(function(classes) {
          return classes.split(' ');
        })
      ).toMatch(cls);
    },
    has_text: function(text, check) {
      expect(this.by_text(text).isDisplayed(), check === undefined ? true : !!check);
    },
    text: function(selector, text) {
      if ('string' === typeof selector) {
        selector = $(selector);
      }

      expect(selector.getText()).toBe(text);
    },
    disabled: function(selector) {
      if ('string' === typeof selector) {
        selector = $(selector);
      }

      //expect(selector.getAttribute('disabled')).toBe('disabled');
      expect(selector.getAttribute('disabled')).toBe(null);
    },
    no_disabled: function(selector) {
      if ('string' === typeof selector) {
        selector = $(selector);
      }

      expect(selector.getAttribute('disabled')).toBe(null);
    },
    value: function(selector, text)  {
      if ('string' === typeof selector) {
        selector = $(selector);
      }

      return selector.getAttribute('value')
      .then(function(value) {
        expect(value).toBe(text);
      });
    },
    count_controls: function(selector, count) {
      if ('string' === typeof selector) {
        selector = $$(selector);
      }

      selector.$$('input').count()
      .then(function(inputs) {
        selector.$$('textarea').count()
        .then(function(textareas) {
          selector.$$('select').count()
          .then(function(selects) {
            expect(inputs + textareas + selects).toBe(count);
          });
        });
      });
    },
    count: function(selector, count) {
      if ('string' === typeof selector) {
        selector = $$(selector);
      }

      expect(selector.count()).toEqual(count);
    },
    control_ko: function(model) {
      var script = 'if (!' +
        'jQuery(\'*[ng-model=\'' + model + '\']\')' +
        '.closest(\'.form-group\').hasClass(\'has-error\')' +
      ') {' +
        'throw new Error(\'error expected\')' +
      '}';

      browser.executeScript(script);
      browser.waitForAngular();
    },
    control_ok: function(model) {
      var script = 'if (' +
        'jQuery(\'*[ng-model=\'' + model + '\']\')' +
        '.closest(\'.form-group\').hasClass(\'has-error\')' +
      ') {' +
        'throw new Error(\'no error expected\')' +
      '}';

      browser.executeScript(script);
      browser.waitForAngular();
    },
    //
    // ExpectedConditions
    //
    wait_visible: function(selector, timeout) {
      var EC = protractor.ExpectedConditions;
      var e = element(by.css(selector));

      browser.wait(EC.presenceOf(e), timeout || 2500);
    },
    wait_toogle: function(selector) {
      var EC = protractor.ExpectedConditions;

      browser.wait(EC.presenceOf($(selector)));
      browser.wait(EC.stalenessOf($(selector)));
    },
    //
    // misc
    //
    // files must be relative to e2e/specs
    upload: function(selector, file) {
      var e = element(by.css(selector));
      var abs = require('path').join(process.env.PWD, file);

      this.set_css(selector, 'visibility', 'visible');
      this.set_css(selector, 'width', 'auto');
      this.set_css(selector, 'height', 'auto');

      e.sendKeys(abs);
      //e.sendKeys(protractor.Key.ENTER);
      //e.click();
      this.set_css(selector, 'visibility', 'hidden');
      browser.waitForAngular();
      // even if we wait, wait a bit longer...
      browser.sleep(500);
    },
    set_css: function(selector, attr, value) {
      var script = 'jQuery(' +
        JSON.stringify(selector) +
        ').css(' +
        JSON.stringify(attr) +
        ',' +
        JSON.stringify(value) +
        ');';

      browser.executeScript(script);
    },
    close_last_window: function() {
      browser.sleep(500);
      browser.getAllWindowHandles()
      .then(function(handles) {
        browser.driver.switchTo().window(handles[1]);
        browser.driver.close();
        browser.driver.switchTo().window(handles[0]);
      });
    },

    drag_to: function(start_sel, finish_sel) {
      //this.position(finish_sel, function(dest) {
      browser.driver.actions().dragAndDrop(start_sel, finish_sel).perform();
      browser.driver.sleep(800);
      //});
    },
    // below will be deprecated soon
    // or goes up :D

    /*
    // usage:
    // config.is_visible('[ng-model='entity.nuevo_formulario2.a']', function(visible) {
    //   expect(visible).toBe(false);
    // });

    is_visible: function(path, callback) {
      browser.executeAsyncScript(function(callback, path) {
        jQuery(path).is(':visible')

      }, path).then(callback);
    },
    */
    button_click: function(text) {
      this.xpath_click(
        '//a[contains(.,\'' + text + '\')]'
      );
    },
    randomize_form: function() {
      $$('section form select').then(function(selects) {
        console.log('selects =', selects.length);
        selects.forEach(function(el_select, idx) {
          el_select.all(by.tagName('option')).then(function(options) {
            console.log('options = ', options.length);

            var max = options.length - 1; // assume first to be blank
            var idx = Math.floor(Math.random() * max);

            options[idx].click();
          });
        });
      });

      $$('section form textarea').then(function(textareas) {
        console.log('textareas =', textareas.length);
        textareas.forEach(function(textarea, idx) {
          textarea.sendKeys(random_str(40));
        });
      });

      $$('section form input').then(function(inputs) {
        console.log('inputs =', inputs.length);
        inputs.forEach(function(input, idx) {

          input.getAttribute('type').then(function(type) {
            console.log('type', type);

            switch (type) {
            case 'text':
              // check datepicker-popup
              input.getAttribute('is-open')
              .then(function(is_datepicker) {
                var txt;

                if ('string' === typeof is_datepicker) {
                  txt = random_date('2015');
                } else {
                  txt = random_str(15);
                }

                console.log('is_datepicker', 'string' === typeof is_datepicker ? 'true' : 'false', txt);

                input.click().sendKeys(txt);
                $('body').click();
              });
              break;
            case 'number':
              input.sendKeys(random_number(5));
              break;
            case 'email':
              input.sendKeys(random_email());
              break;
            case 'checkbox':
              input.click();
            }
          });
        });
      });

      //input|textare
    }

  };
};

module.exports = Config;
