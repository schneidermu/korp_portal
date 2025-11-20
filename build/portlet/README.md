# Build Liferay portlet

1. Build base portlet.

   ```sh
   docker build -t portlet build/portlet/
   mkdir -p art/war/

   # note: specify portlet name, here `korp-portal-portlet`
   docker run --rm -it -v ./art/war:/art portlet korp-portal-portlet
   # -> outputs `art/war/korp-portal-portlet_base.war`
   ```

2. Build your webapp and put the bundle in a folder
   inside the base portlet archive (which is a ZIP archive).

3. Edit `view.jsp` to point to your index files (it's analagous to `index.html`).

See [react](../../react/) for steps 2 and 3 example.
