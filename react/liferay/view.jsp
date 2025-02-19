<%@ include file="init.jsp" %>

<title>Корпоративный портал</title>

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
  rel="stylesheet"
/>

<div id="root"></div>
<script type="module" crossorigin src="<%=request.getContextPath()%>/dist/index.js"></script>
<link rel="stylesheet" crossorigin href="<%=request.getContextPath()%>/dist/index.css">

<portlet:resourceURL var="downloadURL">
    <portlet:param name="file_id" value="id" />
    <portlet:param name="p_p_resource_id" value="downloadFile" />
</portlet:resourceURL>

<script>
    var reactMvcPortlet = {
        portletNamespace: '<portlet:namespace />',
        downloadFullURL: '${downloadURL}'
    };
</script>
