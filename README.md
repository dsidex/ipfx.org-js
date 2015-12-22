# ipfx.org-js
Javascript library which helps to work with ipfx.org animation interpolators. Feel free to contribute!

# Basic usage

1. go to (http://ipfx.org/)
2. create interpolator function
3. copy generated url (data is encoded in the url)
4. pass url as a parameter to IpfxInterpolator.parseUrl() method

## Super simple

```
...
var interpolator = IpfxInterpolator.parseUrl("<urlData>");
...
var y = interpolator.calc(x);
...
```
