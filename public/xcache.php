<?php
$exit = shell_exec('rm -rf ../var/cache/*');
echo "<pre>$exit</pre>";
echo "Cache Deleted";
?>